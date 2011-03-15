<?php
namespace Equinoxe\ExtJSFormBundle\Entity;


class ExtJSForm {

    public function __construct($formDefinition)
    {
        $this->formDefinition = $formDefinition;
    }

    public function getFields(){
        $allowedFields = array();
        $def = \json_decode($this->formDefinition, true);
        if ($def == null) {
            throw new JsonException('Form definition of Webtask ' . $webtask[0]->getUid() . ' is not valid.', \json_last_error());
        }

        if (!isset($def['form'])) {
            throw new \Exception('Form definition doesn\'t contain element form');
        }

        if (!isset($def['form']['items'])) {
            throw new \Exception('Form definition doesn\'t contain element form/items');
        }

        foreach($def['form']['items'] as $field) {
            // TODO: Recursive loop.
            $allowedFields[$field['name']] = $field;
        }
        return $allowedFields;
        
    }


}