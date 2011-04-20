Ext.ns("ExtJSFormBundle");

ExtJSFormBundle.xMap = {};

ExtJSFormBundle.FormEditor = Ext.extend(Ext.Panel, {

    initComponent: function() {

        var self = this;
        self.formIsValid = false;
        self.create = true;

        if (self.form && self.form.get('uid')) {
            self.create = false;
        }

        self.componentSelector = new ExtJSFormBundle.ComponentSelector({
            region: 'west',
            split: true,
            collabsible: true,
            width: 250
        });

        self.formPanel = new Ext.form.FormPanel({
            title: self.form.get('name'),
            bodyStyle: 'padding: 10px',
            tbar: [
                {
                    text: 'Save',
                    icon: '/bundles/flexiflow/images/icons/accept.png',
                    disabled: true
                },
                {
                    text: 'Cancel',
                    icon: '/bundles/flexiflow/images/icons/delete.png',
                    disabled: true
                }
            ]
        });

        self.preview = new Ext.Panel({
            title: 'Preview',
            bodyStyle: 'padding: 10px',
            layout: 'fit',
            region: 'center',
            items: [
                self.formPanel
            ],
            listeners: {
                render: function(obj) {
                    obj.dropZone = new Ext.dd.DropZone(obj.body, {
                        ddGroup: 'test',

                        //      If the mouse is over a grid row, return that node. This is
                        //      provided as the "target" parameter in all "onNodeXXXX" node event handling functions
                        getTargetFromEvent: function(e) {
                            return self.formPanel;
                        },

                        //      On entry into a target node, highlight that node.
                        onNodeEnter : function(target, dd, e, data){
                            //console.log("onNodeEnter", arguments);
                            //Ext.fly(target).addClass('my-row-highlight-class');
                        },

                        //      On exit from a target node, unhighlight that node.
                        onNodeOut : function(target, dd, e, data){
                            //console.log("onNodeout", arguments);
                            //Ext.fly(target).removeClass('my-row-highlight-class');
                        },

                        //      While over a target node, return the default drop allowed class which
                        //      places a "tick" icon into the drag proxy.
                        onNodeOver : function(target, dd, e, data){
                            return Ext.dd.DropZone.prototype.dropAllowed;
                        },

                        //      On node drop we can interrogate the target to find the underlying
                        //      application object that is the real target of the dragged data.
                        //      In this case, it is a Record in the GridPanel's Store.
                        //      We can use the data set up by the DragZone's getDragData method to read
                        //      any data we decided to attach in the DragZone's getDragData method.
                        onNodeDrop : function(target, dd, e, data){
                            if (   data.node
                                && data.node.attributes
                                && data.node.attributes.editorConfig) {                                
                                var component = new data.node.attributes.jsonComponent(data.node.attributes.editorConfig);
                                target.add(component);
                                target.doLayout();
                                self.fireEvent('dirty', self);
                            }
                        }
                    });
                }
            }
        });

        self.aSave = new Ext.Action({
           text: 'Speichern',
           handler: function() {
               var formDefinition = Ext.encode({form: self.getJson()});

               var params = {
                  formDefinition: formDefinition,
                  name: self.form.get('name')
               };

               if (self.create) {
                   params['new'] = true;
               } else {
                   params.uid = self.form.get('uid');
               }

               Ext.Ajax.request({
                  url: 'form/save.json',
                  params: params,
                  success: function(response) {
                      var result = Ext.decode(response.responseText);
                      if (result.success && result.success == true) {
                          self.fireEvent('clean', self);
                      } else {
                          Ext.Msg.alert('Error', result.error);
                      }
                  }
               });
           }
        });

        Ext.apply(this, {
            title: 'Edit form ' + self.form.get('name'),
            layout: 'border',
            tbar: [
                self.aSave,
                {
                    text: 'Get JSON',
                    handler: function() {

                        var win = new Ext.Window({
                            width:  300,
                            height: 400,
                            layout: 'fit',
                            title:  'JSON Output',
                            items: [
                                {
                                    xtype: 'textarea',
                                    value: Ext.ux.JSON.encode(self.getJson())
                                }
                            ]
                        }).show();
                    }
                }
            ],
            items: [
                self.componentSelector,
                self.preview
            ]
        });
        ExtJSFormBundle.FormEditor.superclass.initComponent.call(this);
    },
    getJson: function() {
        var self = this;
        var obj = self.formPanel;
        var config = {items: []};
        var items = obj.items.items;
        for(var i = 0; i < items.length; i++) {
            config.items.push(items[i].storedConfig);
        }
        return config;
    }
});

ExtJSFormBundle.ComponentSelector = Ext.extend(Ext.Panel, {
    initComponent: function() {

        var self = this;

        var propertyEditor = new Ext.grid.PropertyGrid({
            title: 'Properties',
            flex: 1,
            viewConfig : {
                forceFit: true,
                scrollOffset: 2 // the grid will never have scrollbars
            },
            listeners: {
                afterEdit: function(e) {
                    this.currentObject[e.record.id] = e.value;
                    this.currentObject.storedConfig[e.record.id] = e.value;
                    if (e.record.id == 'fieldLabel') {
                        this.currentObject.el.up('.x-form-item', 10, true).child('.x-form-item-label').update(e.value + ': ');
                    }
                    this.currentObject.validate();
                    self.ownerCt.fireEvent('dirty', self.ownerCt);
                    this.currentObject.ownerCt.doLayout();
                }
            }
        });

        this.focus = function(obj) {
            var props = obj.getEditableProperties();
            var conf = {};
            for(var propName in props) {
                if (typeof obj[propName] != 'undefined') {
                    conf[propName] = obj[propName];
                } else {
                    var type = props[propName]['type'];
                    switch (type) {
                        case 'string':
                            conf[propName] = '';
                            break;
                        case 'boolean':
                            conf[propName] = false;
                            break;
                        case 'date':
                            conf[propName] = new Date();
                            break;
                        default:
                            conf[propName] = '';
                    }
                }
            }
            var setNewObject = function() {
                propertyEditor.currentObject = obj;
                propertyEditor.setSource(conf);
            }
            setNewObject.defer(50);
        };

        var focusLost = function(obj) {
            propertyEditor.setSource({});
        };

        var componentList = new Ext.tree.TreePanel({
            title: 'Components',
            rootVisible: false,
            autoHeight: true,
            ddGroup: 'test',
            enableDD: true,
            root: {
                text: 'Elements',
                id: 'src',
                expanded: true,
                children: [
                {
                    text: 'Form elements',
                    expanded: true,
                    children: [
                        ExtJSFormBundle.component.TextField.getTreeNode({listeners: {focus: self.focus}}),
                        {
                            text: 'Fieldset',
                            fieldInfo: {
                                xtype: 'fieldset',
                                title: 'Fieldset',
                                collapsible: true,
                                collapsed: false
                            },
                            draggable: true,
                            leaf: true
                        },
                        {
                            text: 'Combo box',
                            fieldInfo: {
                                xtype: 'combo',
                                fieldLabel: 'Combo box',
                                store: []
                            },
                            draggable: true,
                            leaf: true
                        },
                        {
                            text: 'Textarea',
                            fieldInfo: {
                                xtype: 'textarea',
                                fieldLabel: 'Textarea'
                            },
                            draggable: true,
                            leaf: true
                        },
                        {
                            text: 'Checkbox',
                            fieldInfo: {
                                xtype: 'checkbox',
                                fieldLabel: 'Checkbox'
                            },
                            draggable: true,
                            leaf: true
                        },
                        {
                            text: 'Radiobox',
                            fieldInfo: {
                                xtype: 'radio',
                                fieldLabel: 'Radio box'
                            },
                            draggable: true,
                            leaf: true
                        }
                    ]

                },
                {
                    text: 'Panels',
                    leaf: true
                },
                {
                    text: 'Layouts',
                    leaf: true
                }
                ]
            }
        });

        Ext.apply(this, {
            layout: 'vbox',
            layoutConfig: {
                align : 'stretch',
                pack  : 'start'
            },
            items: [
                componentList,
                propertyEditor
            ]
        });
        ExtJSFormBundle.ComponentSelector.superclass.initComponent.call(this);
    }
});


Ext.ns('ExtJSFormBundle.component');



ExtJSFormBundle.component.TextField = function() {

    var defaultConfig = {
        fieldLabel: 'Text label'
    };

    var editableProperties = {
        fieldLabel: {
            type: 'string',
            allowBlank: false
        },
        name: {
            type: 'string',
            allowBlank: false
        }
    };

    var mandatoryProperties = {};

    for (var propName in editableProperties) {
        if (typeof editableProperties[propName]['allowBlank'] != 'undefined' && editableProperties[propName]['allowBlank'] == false) {
            mandatoryProperties[propName] = true;
        }
    }

    var elemIsValid = false;
    var component = Ext.extend(Ext.form.TextField, {
        storedConfig: {},
        initComponent: function() {
            this.storedConfig = {
                xtype: 'textfield'
            };
            for (var propertyName in editableProperties) {
                if (typeof this[propertyName] != 'undefined') {
                    this.storedConfig[propertyName] = this[propertyName];
                }
            }
            Ext.applyIf(this.storedConfig, defaultConfig);
            Ext.applyIf(this, defaultConfig);

            this.validator = function() {
                for (a in this.getMandatoryProperties()) {
                    if (a in this && this[a].length > 0) {
                        this.elemIsValid = true;
                    } else {
                        this.elemIsValid = 'The field »' + a + '« is mandatory!';
                        break;
                    }
                }
                return this.elemIsValid;
            };

            Ext.apply(this, {
                readOnly: true
            });


            component.superclass.initComponent.call(this);

            this.addListener('afterrender', function(field) {
               field.validate();
            });

        },
        getEditableProperties: function() {
            return editableProperties;
        },
        getMandatoryProperties: function() {
            return mandatoryProperties;
        }
    });
   

    return {
        getTreeNode: function(config) {
            return {
                text: 'Text field',
                id: 'textfield',
                leaf: true,
                jsonComponent: component,
                editableProperties: editableProperties,
                editorConfig: config
            }
        },
        getComponent: function() {
            return component;
        }
    };
}();

ExtJSFormBundle.xMap['textfield'] = ExtJSFormBundle.component.TextField.getComponent();





