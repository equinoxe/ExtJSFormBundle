Ext.ns('ExtJSFormBundle');

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
                    // Allow the injection of a setter Method for advanced properties.
                    var props = this.currentObject.getEditableProperties();
                    if (props[e.record.id] && typeof props[e.record.id]['setter'] == 'object' && props[e.record.id]['setter'].method) {
                        var method = props[e.record.id]['setter'].method;
                        this.currentObject[method](e.value);
                    } else {
                        this.currentObject[e.record.id] = e.value;
                    }
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
                        case 'number':
                            conf[propName] = 0;
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
        
        this.maskIt = function(field) {
            var wrap = field.el.up('div.x-form-item');
            var mask = wrap.mask(null, 'formbundle-mask');
            
            mask.on('focus', function() {
                console.log('focus');
            });
            
            mask.on('blur', function() {
                console.log('blur');
            });
            
            mask.on('click', function() {
                var elements = Ext.DomQuery.jsSelect('.formmanagement .x-form-item.x-masked.focus');
                for (var i=0; i<elements.length; i++) {
                    Ext.get(elements[i]).removeClass('focus');
                }
                var element = mask.up('div.x-form-item.x-masked');
                element.addClass('focus');
                field.focus(field);
            });
        };

        var nodeConfig = {
            listeners: {
                focus: self.focus,
                afterrender: self.maskIt
            }
        }

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
                        ExtJSFormBundle.component.TextField.getTreeNode(nodeConfig),
                        ExtJSFormBundle.component.TextArea.getTreeNode(nodeConfig),
                        ExtJSFormBundle.component.Checkbox.getTreeNode(nodeConfig)/*,
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
                        }*/
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