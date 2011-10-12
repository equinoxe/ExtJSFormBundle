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
            autoScroll: true,
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