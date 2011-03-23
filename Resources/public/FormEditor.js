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
                                && data.node.attributes.fieldInfo) {
                                target.add(data.node.attributes.fieldInfo);
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
                    console.log("AFTER EDIT", e);
                    this.currentObject[e.record.id] = e.value;
                    if (e.record.id == 'fieldLabel') {
                        this.currentObject.el.up('.x-form-item', 10, true).child('.x-form-item-label').update(e.value + ': ');
                    }
                    this.currentObject.ownerCt.doLayout();
                }
            }
        });

        var focus = function(obj) {
            var conf = {};
            for(var propName in obj.editableProperties) {
                if (typeof obj[propName] != 'undefined') {
                    conf[propName] = obj[propName];
                } else {
                    var type = obj.editableProperties[propName];
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
                        {
                            text: 'Text field',
                            fieldInfo: {
                                xtype: 'textfield',
                                fieldLabel: 'Text label',
                                editableProperties: {
                                    fieldLabel: 'string',
                                    name: 'string',
                                    datum: 'date'
                                },
                                listeners: {
                                    focus: focus
                                }
                            },
                            draggable: true,
                            leaf: true
                        },
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