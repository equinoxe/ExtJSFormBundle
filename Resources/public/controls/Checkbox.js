Ext.ns('ExtJSFormBundle.component');
ExtJSFormBundle.component.Checkbox = function() {

    var defaultConfig = {
        fieldLabel: 'Text label',
        inputValue: '1'
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
        inputValue: {
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
    var component = Ext.extend(Ext.form.Checkbox, {
        storedConfig: {},
        initComponent: function() {
            this.storedConfig = {
                xtype: 'checkbox'
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
        /**
         * The configuration object of the tree node.
         *
         * @return Object
         */
        getTreeNode: function(config) {
            return {
                text: 'Checkbox',
                id: 'checkbox',
                leaf: true,
                jsonComponent: component,
                editableProperties: editableProperties,
                editorConfig: config
            }
        },
        
        /**
         * Returns the component.
         * 
         * @return Ext.Component
         */
        getComponent: function() {
            return component;
        }
    };
}();
ExtJSFormBundle.xMap['checkbox'] = ExtJSFormBundle.component.Checkbox.getComponent();