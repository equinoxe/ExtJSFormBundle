Ext.ns("ExtJSFormBundle");



ExtJSFormBundle.FormEditor = Ext.extend(Ext.Panel, {

    initComponent: function() {

        var componentSelector = new ExtJSFormBundle.ComponentSelector({
            region: 'west',
            split: true,
            collabsible: true,
            width: 250
        });

        var formPanel = new Ext.form.FormPanel({
            title: 'New Form',
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

        var preview = new Ext.Panel({
            title: 'Preview',
            bodyStyle: 'padding: 10px',
            layout: 'fit',
            region: 'center',
            items: [
                formPanel
            ],
            listeners: {
                render: function(obj) {
                    obj.dropZone = new Ext.dd.DropZone(obj.body, {
                        ddGroup: 'test',

                        //      If the mouse is over a grid row, return that node. This is
                        //      provided as the "target" parameter in all "onNodeXXXX" node event handling functions
                        getTargetFromEvent: function(e) {
                            return formPanel;
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
                            }
                        }
                    });
                }
            }
        });

        Ext.apply(this, {
            title: 'Form Designer',
            layout: 'border',
            tbar: [
                {
                    text: 'Get JSON',
                    handler: function() {
                        var getJson = function(obj) {
                            var config = {items: []};
                            var items = obj.items.items;
                            for(var i = 0; i < items.length; i++) {
                                config.items.push(items[i].storedConfig);
                            }
                            return config;
                        }

                        var win = new Ext.Window({
                            width:  300,
                            height: 400,
                            layout: 'fit',
                            title:  'JSON Output',
                            items: [
                                {
                                    xtype: 'textarea',
                                    value: Ext.ux.JSON.encode(getJson(formPanel))
                                }
                            ]
                        }).show();
                    }
                }
            ],
            items: [
                componentSelector,
                preview
            ]
        });
        ExtJSFormBundle.FormEditor.superclass.initComponent.call(this);
    }
});

ExtJSFormBundle.ComponentSelector = Ext.extend(Ext.Panel, {
    initComponent: function() {

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
                    this.currentObject.ownerCt.doLayout();
                }
            }
        });

        var focus = function(obj) {
            var props = obj.getEditableProperties();
            var conf = {};
            for(var propName in props) {
                if (typeof obj[propName] != 'undefined') {
                    conf[propName] = obj[propName];
                } else {
                    var type = props[propName];
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
            propertyEditor.currentObject = obj;
            propertyEditor.setSource(conf);
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
                        ExtJSFormBundle.component.TextField.getTreeNode({listeners: { focus: focus}}),
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
        fieldLabel: 'string',
        name:       'string'
    };

    var component = Ext.extend(Ext.form.TextField, {
        storedConfig: {},
        initComponent: function() {
            this.storedConfig = {
                xtype: 'textfield'
            };
            Ext.apply(this.storedConfig, defaultConfig);
            Ext.apply(this, defaultConfig);
            component.superclass.initComponent.call(this);
        },
        getEditableProperties: function() {
            return editableProperties;
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





