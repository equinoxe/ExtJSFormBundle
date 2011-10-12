Ext.ns('ExtJSFormBundle.component');
ExtJSFormBundle.component.TextArea = function() {

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
        },
        height: {
            type: 'number',
            allowBlank: true,
            setter: {
                method: 'setHeight'
            }
        },
        width: {
            type: 'number',
            allowBlank: true,
            setter: {
                method: 'setWidth'
            }
        }
    };

    var mandatoryProperties = {};

    for (var propName in editableProperties) {
        if (typeof editableProperties[propName]['allowBlank'] != 'undefined' && editableProperties[propName]['allowBlank'] == false) {
            mandatoryProperties[propName] = true;
        }
    }

    var elemIsValid = false;
    var component = Ext.extend(Ext.form.TextArea, {
        storedConfig: {},
        initComponent: function() {
            this.storedConfig = {
                xtype: 'textarea'
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
                text: 'Text area',
                id: 'textarea',
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
ExtJSFormBundle.xMap['textarea'] = ExtJSFormBundle.component.TextArea.getComponent();