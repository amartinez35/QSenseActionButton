define(['css!./QSenseActionButton.css', 'qlik', 'ng!$q'],

  function(template, qlik, $q) {
    "use strict";
    //palette de couleur par défaut
    
    var Test = qlik.currApp(this);
    var getSheetList = function () {

		var defer = $q.defer();

		Test.getAppObjectList( function ( data ) {
			var sheets = [];
			var sortedData = _.sortBy( data.qAppObjectList.qItems, function ( item ) {
				return item.qData.rank;
			} );
			_.each( sortedData, function ( item ) {
				sheets.push( {
					value: item.qInfo.qId,
					label: item.qMeta.title
				} );
			} );
			return defer.resolve( sheets );
		} );

		return defer.promise;
	};
    
    var dropSheet = {
      ref: "dropSheet",
      type: "string",
      label: "Liste des feuilles",
      component: "dropdown",
      options: function () {
			return getSheetList().then( function ( items ) {
				return items;
			} );
		}
    };
    
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

    //palette de sélection couleur 1
    var colorTextDef = {
       ref: "ctext",
       type: "integer",
       translation: "properties.color",
       component: "color-picker",
       label: "Text",
       defaultValue: 3
     };

    var colorBgDef = {
      ref: "cBg",
      type: "integer",
      translation: "properties.color",
      component: "color-picker",
      label: "Bg",
      defaultValue: 1
    };

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

    var zone1 = {
      type: "string",
      ref: "zoneAction1",
      label: "Nom variable / champ"
    };
    var zone2 = {
      type: "string",
      ref: "zoneAction2",
      label: "Valeur"
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
          measures: {
            uses: "measures",
            min: 1,
            max: 1
          },
          Setting: {
            uses: "settings",
            items: {
                          Colors: {
                            ref: "Color",
                            type: "items",
                            label: "Couleurs du bouton",
                            items: {
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
          }
        }
      },
      snapshot: {
        canTakeSnapshot: true
      },

      //affichage de l'objet
      paint: function($element, layout) {

        var app = qlik.currApp(this);

        //Taille de l'objet
        var width = $element.width();
        var height = $element.height();

        //recup des données
        var hc = layout.qHyperCube;


        //recup de la valeur de la mesure
        var value = hc.qDataPages[0].qMatrix[0][0].qText;

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

        var myButton = '<button class="qui-button" style="font-size:13px;" 	data-cmd="' + value + '">' + value + '</button>';
        div.innerHTML = myButton;

        //couleur arc 1 et 2
        var colorText = palette[layout.ctext];
        var colorBg = palette[layout.cBg];

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
    };

  });