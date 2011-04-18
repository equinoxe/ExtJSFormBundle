Ext.ns("ExtJSFormBundle.view");

ExtJSFormBundle.view.FormManager = Ext.extend(Ext.TabPanel, {
    initComponent: function() {
        var self = this;
        var action = {
            'open': new Ext.Action({
                text: 'Open',
                disabled: false,
                icon: '/bundles/flexiflow/images/icons/edit.png',
                handler: function() {
                    var record = self.list.getSelectionModel().getSelected();
                    var exec = new ExtJSFormBundle.FormEditor({
                        form: record,
                        closable: true
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
