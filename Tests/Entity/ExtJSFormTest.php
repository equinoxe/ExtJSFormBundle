<?php
namespace Equinoxe\ExtJSFormBundle\Entity;

class ExtJSFormTest extends \Equinoxe\TestBundle\Test\WebTestCase
{
    protected function setUp()
    {
        $this->container = $this->createContainer();
    }
    
    protected function tearDown()
    {
        unset($this->container);
    }



    public function testGetFields()
    {
        $definition = '
            {
                "form": {
                    "defaultType": "textfield",
                    "items": [
                        {
                            "name":       "field_1",
                            "fieldLabel": "Feld 1"
                        },
                        {
                            "xtype":      "textfield",
                            "name":       "field_2",
                            "fieldLabel": "Feld 2"
                        },
                        {
                            "xtype":       "fieldset",
                            "autoHeight":  true,
                            "defaultType": "checkbox",
                            "items": [
                                {
                                    "name":       "field_3",
                                    "fieldLabel": "Feld 3"
                                },
                                {
                                    "name":       "field_4",
                                    "fieldLabel": "Feld 4",
                                    "xtype":      "textfield"
                                }
                            ]
                        }
                    ]
                }
            }
        ';
        $this->object = new ExtJSForm($definition);
        $this->assertEquals(array(
                'field_1' => array(
                    'name' => 'field_1',
                    'fieldLabel' => 'Feld 1',
                    'xtype' => 'textfield'
                ),
                'field_2' => array(
                    'name' => 'field_2',
                    'fieldLabel' => 'Feld 2',
                    'xtype' => 'textfield'
                ),
                'field_3' => array(
                    'name' => 'field_3',
                    'fieldLabel' => 'Feld 3',
                    'xtype' => 'checkbox'
                ),
                'field_4' => array(
                    'name' => 'field_4',
                    'fieldLabel' => 'Feld 4',
                    'xtype' => 'textfield'
                )
            ),
            $this->object->getFields()
        );
    }

    public function testGetMandatoryFields()
    {
        $definition = '
            {
                "form": {
                    "defaultType": "textfield",
                    "items": [
                        {
                            "name":       "field_1",
                            "fieldLabel": "Feld 1"
                        },
                        {
                            "xtype":      "textfield",
                            "name":       "field_2",
                            "fieldLabel": "Feld 2",
                            "allowBlank": false
                        },
                        {
                            "xtype":       "fieldset",
                            "autoHeight":  true,
                            "defaultType": "checkbox",
                            "items": [
                                {
                                    "name":       "field_3",
                                    "fieldLabel": "Feld 3",
                                    "allowBlank": false
                                }
                            ]
                        }
                    ]
                }
            }
        ';
        $this->object = new ExtJSForm($definition);
        $this->assertEquals(array(
                'field_2' => array(
                    'name' => 'field_2',
                    'fieldLabel' => 'Feld 2',
                    'xtype' => 'textfield',
                    'allowBlank' => false
                ),
                'field_3' => array(
                    'name' => 'field_3',
                    'fieldLabel' => 'Feld 3',
                    'xtype' => 'checkbox',
                    'allowBlank' => false
                )
            ),
            $this->object->getMandatoryFields()
        );
    }

    public function testGetFieldsBy()
    {
        $definition = '
            {
                "form": {
                    "defaultType": "textfield",
                    "items": [
                        {
                            "name":       "field_1",
                            "fieldLabel": "Feld 1"
                        },
                        {
                            "xtype":      "textfield",
                            "name":       "field_2",
                            "fieldLabel": "Feld 2",
                            "allowBlank": false
                        },
                        {
                            "xtype":       "fieldset",
                            "autoHeight":  true,
                            "defaultType": "checkbox",
                            "items": [
                                {
                                    "name":       "field_3",
                                    "fieldLabel": "Feld 3",
                                    "allowBlank": false
                                }
                            ]
                        }
                    ]
                }
            }
        ';
        $this->object = new ExtJSForm($definition);
        $this->assertEquals(array(
                'field_1' => array(
                    'name' => 'field_1',
                    'fieldLabel' => 'Feld 1',
                    'xtype' => 'textfield'
                ),
                'field_2' => array(
                    'name' => 'field_2',
                    'fieldLabel' => 'Feld 2',
                    'xtype' => 'textfield',
                    'allowBlank' => false
                )
            ),
            $this->object->getFieldsBy('xtype', 'textfield')
        );

        $this->assertEquals(array(
                'field_3' => array(
                    'name' => 'field_3',
                    'fieldLabel' => 'Feld 3',
                    'xtype' => 'checkbox',
                    'allowBlank' => false
                )
            ),
            $this->object->getFieldsBy('fieldLabel', 'Feld 3')
        );

        $this->assertEquals(array(), $this->object->getFieldsBy('fieldLabel', 'Feld x'));
    }

    public function testFormDefinition()
    {
        $formDefinition = $this->generateRandomString();
        $this->object = new ExtJSForm('tmp');
        $this->object->setFormDefinition($formDefinition);
        $this->assertEquals($formDefinition, $this->object->getFormDefinition());
    }

}