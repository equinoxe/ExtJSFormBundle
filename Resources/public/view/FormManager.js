Ext.ns("ExtJSFormBundle.view");
ExtJSFormBundle.view.FormManager = Ext.extend(Ext.TabPanel, {
    initComponent: function() {
        Ext.apply(this, {
            title: 'Form Management'
        });
        ExtJSFormBundle.view.FormManager.superclass.initComponent.call(this);
    }
})
