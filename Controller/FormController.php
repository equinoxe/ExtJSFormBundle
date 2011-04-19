<?php

namespace Equinoxe\ExtJSFormBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

use Doctrine\Common\Collections\ArrayCollection;

class FormController extends Controller
{
    public function indexAction()
    {
        return $this->render('ExtJSFormBundle:Form:index.html.twig');
    }

    /**
     * Controller for the list Action.
     *
     * @return Response The content of the view
     */
    public function listAction($_format)
    {
        $simpleOutput = $this->get('equinoxe.simpleoutput');
        try {
            if (!$this->get('security.context')->vote('ROLE_ADMIN')) {
                throw new Exception('Access denied.');
            }

            $em = $this->get('doctrine.orm.entity_manager');
            $items = $em->getRepository('Equinoxe\ExtJSFormBundle\Entity\ExtJSForm')->findAll();

            $resultList = array();
            foreach($items as $item) {
                $resultList[] = array(
                    "uid" => $item->getUid(),
                    "name" => $item->getName()
                );
            }

            $result = array(
                'total' => count($items),
                'items' => $resultList
            );

            return new Response($simpleOutput->convert($result, $_format));
        } catch (\Exception $e) {
            return new Response($simpleOutput->convert($response, $_format));
        }
    }

    public function getAction($id, $_format)
    {
        $simpleOutput = $this->get('equinoxe.simpleoutput');
        try {
            $em = $this->get('doctrine.orm.entity_manager');
            $item = $em->find('Equinoxe\ExtJSFormBundle\Entity\ExtJSForm', $id);

            $response = array(
                "uid" => $item->getUid(),
                "formDefinition" => \json_decode($item->getFormDefinition()),
                "name" => $item->getName()
            );

            return new Response($simpleOutput->convert($response, $_format));
        } catch (Exception $e) {
            $response = array("success" => false, "error" => $e->getMessage());
            return new Response($simpleOutput->convert($response, $_format));
        }
    }

    public function saveAction()
    {
        try {
            if (!$this->get('security.context')->vote('ROLE_ADMIN')) {
                throw new \Exception("Access denied. Role ROLE_ADMIN required.");
            }

            if (!isset($_POST['name']) || empty($_POST['name'])) {
                throw new \Exception("The name of the form cannot be empty");
            }
            $name = $_POST['name'];

            if (!isset($_POST['formDefinition']) || empty($_POST['formDefinition'])) {
                throw new \Exception("The formDefinition cannot be empty");
            }
            $formDefinition = $_POST['formDefinition'];

            $em = $this->get('doctrine.orm.entity_manager');

            if (isset($_POST['new'])) {

                //
                // Create form.
                //

                $form = new \Equinoxe\ExtJSFormBundle\Entity\ExtJSForm($formDefinition);
                $form->setName($name);
                $em->persist($form);
            } else {

                //
                // Edit form.
                //

                if (!isset($_POST['uid']) || empty($_POST['uid'])) {
                    throw new \Exception("The uid is required for editing.");
                }

                $uid = $_POST['uid'];

                $form = $em->find('Equinoxe\ExtJSFormBundle\Entity\ExtJSForm', $uid);
                $form->setName($name);
                $form->setFormDefinition($formDefinition);
            }

            $em->flush();

            return new Response("{success: true}");

        } catch (\Exception $e) {
            return new Response("{success: false, error: '" . $e->getMessage() . "'}");
        }
    }

    public function deleteAction($_format)
    {
        try {
            // Check rights.
            if (!$this->get('security.context')->vote('ROLE_ADMIN')) {
                throw new \Exception("Access denied. Role ROLE_ADMIN required.");
            }

            // Are roles supplied?
            if (!isset($_POST['roles']) || empty($_POST['roles'])) {
                throw new \Exception("No roles supplied.");
            }

            // Parse them to an array.
            $roles = array($_POST['roles']);
            if (\strstr($_POST['roles'], ',')) {
                $roles = \explode(',', $_POST['roles']);
            }

            $em = $this->get('doctrine.orm.entity_manager');

            // Delete them.
            foreach ($roles as $uid) {
                $role = $em->find('Equinoxe\AuthenticationBundle\Entity\Role', $uid);
                if (!$role) {
                    throw new \Exception("Role with id $uid doesn't exist.");
                }
                $em->remove($role);
                $em->flush();
            }

            $response = array("success" => true);
            return new Response($simpleOutput->convert($response, $_format));

        } catch (\Exception $e) {
            $response = array("success" => false, "error" => $e->getMessage());
            return new Response($simpleOutput->convert($response, $_format));
        }
    }
}
