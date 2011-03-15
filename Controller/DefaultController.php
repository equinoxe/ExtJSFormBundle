<?php

namespace Equinoxe\ExtJSFormBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('ExtJSFormBundle:Default:index.html.twig');
    }
}
