Ext.ns("ExtJSFormBundle.view");

ExtJSFormBundle.view.FormManager = Ext.extend(Ext.TabPanel, {
    initComponent: function() {
        var self = this;

        if (!self.editorPlugins) {
            self.editorPlugins = [];
        }

        var action = {
            'add': new Ext.Action({
                text: 'Add',
                disabled: false,
                icon: '/bundles/flexiflow/images/icons/add.png',
                handler: function() {
                    
                    Ext.Msg.prompt('New form', 'Please enter the name of the new form:', function(btn, text) {
                        if (btn == 'ok') {
                            var exec = new ExtJSFormBundle.FormEditor({
                                closable: true,
                                form: new Ext.data.Record({
                                    name: text
                                }),
                                plugins: self.editorPlugins
                            });
                            self.add(exec).show();
                        }                    
                    });
                }
            }),
            'open': new Ext.Action({
                text: 'Open',
                disabled: true,
                icon: '/bundles/flexiflow/images/icons/edit.png',
                handler: function() {
                    var record = self.list.getSelectionModel().getSelected();
                    var exec = new ExtJSFormBundle.FormEditor({
                        plugins: self.editorPlugins,
                        form: record,
                        closable: true,
                        listeners: {
                            afterRender: function(editor) {
                                // Laden...
                                Ext.Ajax.request({
                                    url: 'form/get/' + record.get('uid') + '.json',
                                    success: function(response) {
                                        var res = Ext.decode(response.responseText);
                                        var form = res.formDefinition.form;
                                        editor.formPanel.removeAll();
                                        for(var i=0; i<form.items.length; i++) {
                                            if (ExtJSFormBundle.xMap[form.items[i].xtype]) {
                                                Ext.apply(form.items[i], {listeners: {focus: editor.componentSelector.focus}});
                                                editor.formPanel.add(
                                                    new ExtJSFormBundle.xMap[form.items[i].xtype](form.items[i])
                                                );
                                            }
                                        }
                                        editor.formPanel.doLayout();
                                    }
                                });
                            }
                        }
                    });
                    self.add(exec).show();
                }
            })
        };

        this.listStore = new Ext.data.JsonStore({
            autoDestroy: true,
            autoLoad: true,
            url: '/form/list.json',
            root: 'items',
            fields: [
                'uid',
                'name'
            ]
        });
        this.list = new Ext.grid.GridPanel({
            title: 'Available Forms',
            bbar: new Ext.PagingToolbar({
               store: this.listStore,
               pageSize: 25
            }),
            tbar: [
                action.add,
                action.open
            ],
            store: this.listStore,
            autoExpandColumn: 'name',
            columns: [
                {
                    dataIndex: 'uid',
                    header: 'uid',
                    width: 50
                },
                {
                    dataIndex: 'name',
                    header: 'name',
                    id: 'name',
                    width: 200
                },
            ],
            sm: new Ext.grid.RowSelectionModel({
                singleSelect:true,
                listeners: {
                    selectionchange: function(selModel) {
                        action.open.setDisabled(selModel.getCount() == 0);
                    }
                }
            }),
            listeners: {
                rowdblclick: function() {
                    action.open.initialConfig.handler();
                }
            }
        });

        Ext.apply(this, {
            title: 'Form Management',
            activeTab: 0,
            items: [
                self.list
            ]
        });
        ExtJSFormBundle.view.FormManager.superclass.initComponent.call(this);
    }
});
//Flexiflow.view.register('Flexiflow.FormManmager', ExtJSFormBundle.view.FormManager);
