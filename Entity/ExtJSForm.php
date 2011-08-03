<?php
namespace Equinoxe\ExtJSFormBundle\Entity;

use Equinoxe\ExtJSFormBundle\Exceptions\JsonException;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 */
class ExtJSForm
{
    private $valueTypes = array(
        'textfield',
        'checkbox'
    );

    /**
     * Unique number for every form. Auto incremented.
     *
     * @var integer
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $uid;

    /**
     * The name of the form.
     *
     * @var string
     * @ORM\Column(type="string")
     */
    private $name;

    /**
     * The json Ext JS form definition.
     *
     * @var string
     * @ORM\Column(type="text")
     */
    private $formDefinition;

    public function __construct($formDefinition = null)
    {
        $this->formDefinition = $formDefinition;
    }

    public function getFields()
    {
        $allowedFields = array();
        $def = \json_decode($this->formDefinition, true);
        if ($def == null) {
            throw new JsonException('Form definition of is not valid.', \json_last_error());
        }

        if (!isset($def['form'])) {
            throw new \Exception('Form definition doesn\'t contain element form');
        }

        if (!isset($def['form']['items'])) {
            throw new \Exception('Form definition doesn\'t contain element form/items');
        }

        $defaultType = null;
        if (isset($def['form']['defaultType'])) {
            $defaultType = $def['form']['defaultType'];
        }
        
        return $this->getFieldsFromArray($def['form']['items'], $defaultType);
    }

    function getFieldsFromArray($array, $defaultType = null)
    {
        $allowedFields = array();
        foreach($array as $field) {
            if (!isset($field['xtype'])) {
                if ($defaultType == null) {
                    continue;
                }
                $field['xtype'] = $defaultType;
            }
            if(in_array($field['xtype'], $this->valueTypes)) {
                if (!isset($field['name'])) {
                    throw new \Exception("Name not set for field " . $field['xtype']);
                }
                $allowedFields[$field['name']] = $field;
            }

            if (isset($field['items'])) {
                if (isset($field['defaultType'])) {
                    $defaultType = $field['defaultType'];
                }
                $allowedFields = array_merge($allowedFields, $this->getFieldsFromArray($field['items'], $defaultType));
            }
        }
        return $allowedFields;
    }

    public function getMandatoryFields()
    {
        $mandatoryFields = array();
        $fields = $this->getFields();
        foreach($fields as $field) {
            if (isset($field['allowBlank']) && $field['allowBlank'] == false) {
                $mandatoryFields[$field['name']] = $field;
            }
        }
        return $mandatoryFields;
    }

    public function getFieldsBy($property, $value)
    {
        $matched = array();
        $fields = $this->getFields();
        foreach($fields as $field) {
            if (isset($field[$property]) && $field[$property] == $value) {
                $matched[$field['name']] = $field;
            }
        }
        return $matched;
    }

    /**
     * Getter for $formDefinition.
     *
     * @return <type>
     */
    public function getFormDefinition()
    {
        return $this->formDefinition;
    }

    /**
     * Setter for $formDefinition.
     *
     * @param string $formDefinition The json Ext JS string.
     */
    public function setFormDefinition($formDefinition)
    {
        $this->formDefinition = $formDefinition;
    }


    public function getUid()
    {
        return $this->uid;
    }

    public function setUid($uid)
    {
        $this->uid = $uid;
    }

    public function getName()
    {
        return $this->name;
    }

    public function setName($name)
    {
        $this->name = $name;
    }
}