define(['css!./QSenseActionButton.css', 'qlik', 'ng!$q'],

  function(template, qlik, $q) {
    "use strict";

    var Test = qlik.currApp(this);

    //liste des feuilles de l'application
    var getSheetList = function() {

      var defer = $q.defer();

      Test.getAppObjectList(function(data) {
        var sheets = [];
        var sortedData = _.sortBy(data.qAppObjectList.qItems, function(item) {
          return item.qData.rank;
        });
        _.each(sortedData, function(item) {
          sheets.push({
            value: item.qInfo.qId,
            label: item.qMeta.title
          });
        });
        return defer.resolve(sheets);
      });

      return defer.promise;
    };

    //construction de la liste dérouante
    var dropSheet = {
      ref: "dropSheet",
      type: "string",
      label: "Liste des feuilles",
      component: "dropdown",
      options: function() {
        return getSheetList().then(function(items) {
          return items;
        });
      }
    };

    //palette de couleur par défaut
    var palette = [
      "#b0afae",
      "#7b7a78",
      "#545352",
      "#4477aa",
      "#7db8da",
      "#b6d7ea",
      "#46c646",
      "#f93f17",
      "#ffcf02",
      "#276e27",
      "#ffffff",
      "#000000"
    ];

    //palette de couleur du texte
    var colorTextDef = {
      ref: "ctext",
      type: "integer",
      translation: "properties.color",
      component: "color-picker",
      label: "Text",
      defaultValue: 10
    };

    //palette de couleur du fond de l'objet
    var colorBgDef = {
      ref: "cBg",
      type: "integer",
      translation: "properties.color",
      component: "color-picker",
      label: "Bg",
      defaultValue: 3
    };

    var textLabel = {
      ref: "valueText",
      type: "string",
      label: "Texte",
      expression: "always",
      defaultValue: "Click me"
    };

    //liste des actions possible
    var dropAction = {
      type: "string",
      component: "dropdown",
      label: "Action",
      ref: "myAction",
      options: [{
        value: "clearAll",
        label: "Effacer tout"
      }, {
        value: "lockAll",
        label: "Verrouiller tout"
      }, {
        value: "lockOne",
        label: "Verrouiller un champ"
      }, {
        value: "selectOne",
        label: "Sélectionner dans le champ"
      }, {
        value: "setVar",
        label: "Définir la variable"
      }, {
        value: "nextSheet",
        label: "Feuille suivante"
      }, {
        value: "prevSheet",
        label: "Feuille précédente"
      }, {
        value: "selectSheet",
        label: "Activer la feuille"
      }],
      defaultValue: "clearAll"
    };

    //Zone de saisie 1 (nom de champ ou variable)
    var zone1 = {
      type: "string",
      ref: "zoneAction1",
      label: "Nom variable / champ"
    };
    //Zone de saisie 2 (valeur)
    var zone2 = {
      type: "string",
      ref: "zoneAction2",
      label: "Valeur"
    };
    
    //switch bold  normal
    var switchBold ={
      type: "string",
      component: "buttongroup",
      label: "Orientation buttons",
      ref: "switchFont",
      options: [{
	    value: "normal",
		label: "Normal",
		tooltip: "Select for vertical"
      }, {
        value: "bold",
		label: "Gras",
		tooltip: "Select for vertical"
      }],
		defaultValue: "normal"
    };

    //définition de l'objet
    return {
      initialProperties: {
        qHyperCubeDef: {
          qDimensions: [],
          qMeasures: [],
          qInitialDataFetch: [{
            qWidth: 2,
            qHeight: 50
          }]
        }
      },
      definition: {
        type: "items",
        component: "accordion",

        items: {
          //nombre de mesure
          Setting: {
            component: "expandable-items",
            label: "Configuration",
            items: {
              ValeurText: {
                ref: "valeurMenu",
                type: "items",
                label: "Look & feel",
                items: {
                  textLabel: textLabel,
                  switchBold: switchBold,
                  Colors1: colorTextDef,
                  Colors2: colorBgDef
                }
              },
              MyDropdownProp: {
                ref: "Action",
                type: "items",
                label: "Action",
                items: {
                  dropAction: dropAction,
                  dropSheet: dropSheet,
                  zone1: zone1,
                  zone2: zone2
                }
              }
            }
          },
        }
      },

      //affichage de l'objet
      paint: function($element, layout) {

        var app = qlik.currApp(this);

        //Taille de l'objet
        var width = $element.width() - 10;
        var height = $element.height() - 10;
        var fonSize = 16;

        var id = "container_" + layout.qInfo.qId;

        //ça marche mais pourquoi ?
        if (document.getElementById(id)) {
          $("#" + id).empty();
        } else {
          //$element.append($('<div />').attr("id", id));
          $element.append($('<div />').attr("id", id).width(width).height(height));
        }
        //recup de la zone d'affichage
        var div = document.getElementById(id);

        //couleur du text et du bg
        var colorText = palette[layout.ctext];
        var colorBg = palette[layout.cBg];

        //génération du bouton
        var myButton = '<button class="button" style="font-size:' + fonSize + 'px;background-color:' + colorBg + ';color:' + colorText + ';width:' + width + 'px;height:' + height + 'px;font-weight:'+layout.switchFont+'">' + layout.valueText + '</button>';
        div.innerHTML = myButton;

        //traitement des actions si on est en mode analysis
        if (qlik.navigation.getMode() == 'analysis') {
          $element.find("button").on("qv-activate", function() {
            switch (layout.myAction) {
              case 'clearAll':
                app.clearAll();
                break;
              case 'lockAll':
                app.lockAll();
                break;
              case 'lockOne':
                app.field(layout.zoneAction1).lock();
                break;
              case 'selectOne':
                app.field(layout.zoneAction1).selectValues([layout.zoneAction2], false, false);
                break;
              case 'setVar':
                app.variable.setStringValue(layout.zoneAction1, layout.zoneAction2);
                break;
              case 'nextSheet':
                qlik.navigation.nextSheet();
                break;
              case 'prevSheet':
                qlik.navigation.prevSheet();
                break;
              case 'selectSheet':
                qlik.navigation.gotoSheet(layout.dropSheet);
                break;
            }
          });
        }
      }
    };

  });