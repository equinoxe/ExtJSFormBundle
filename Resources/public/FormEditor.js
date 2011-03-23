Ext.ns("ExtJSFormBundle");

ExtJSFormBundle.FormEditor = Ext.extend(Ext.Panel, {

    initComponent: function() {

        var componentSelector = new ExtJSFormBundle.ComponentSelector({
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
            flex: 1,
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
            layout: 'hbox',
            layoutConfig: {
                align : 'stretch',
                pack  : 'start'
            },
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

        var componentList = new Ext.tree.TreePanel({
            rootVisible: false,
            ddGroup: 'test',
            border: false,
            enableDD: true,
            root: {
                text: 'Elements',
                id: 'src',
                expanded: true,
                children: [
                {
                    text: 'Form elements',
                    children: [
                        {
                            text: 'Text field',
                            fieldInfo: {
                                xtype: 'textfield',
                                fieldLabel: 'Text label'
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
           title: 'Components',
           layout: 'fit',
           items: [
               componentList
           ]
        });
        ExtJSFormBundle.ComponentSelector.superclass.initComponent.call(this);
    }
});