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