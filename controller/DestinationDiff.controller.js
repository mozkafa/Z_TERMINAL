sap.ui.define([
	"com/btc/terminal/controller/BaseController",
	"com/btc/terminal/model/formatter",
	"sap/ui/model/json/JSONModel"
], function(BaseController,formatter,JSONModel) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.DestinationDiff", {

		 /**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.btc.terminal.view.DestinationDiff
		 */
		 formatter : formatter,
		 onInit: function() {
					this.getRouter().getRoute("destinationDiff").attachPatternMatched(this._onRouteMatched, this);
		 },
		 _onRouteMatched : function(oEvent){
			var parameters = oEvent.getParameter("arguments");
			this.HU = parameters.HU;
			var putAwayModel = this.getModel("putAwayModel");
			var putAwayData = putAwayModel.getData();
			if(putAwayData){
				var diffPageModel = new JSONModel({
					actQ : putAwayData.DiffActualQuantity,
					destDiffQ : "",
					diffIndex : ""
				});
				this.setModel(diffPageModel, "diffPageModel");
			}
			else{
				//
				this.navToMain();
			}
		},

		 /**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.btc.terminal.view.DestinationDiff
		 */
		 onBeforeRendering: function() {
	
		 },

		 /**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.btc.terminal.view.DestinationDiff
		 */
		 onAfterRendering: function() {
	
		 },
	
		 /**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.btc.terminal.view.DestinationDiff
		 */
		 onExit: function() {
	
		 },
		closeDetailDialog: function(oEvent){
			this.detailDestDialog.close();
		},
		 diffDetailPressed : function(oEvent){
			if (!this.detailDestDialog) {
				this.detailDestDialog = new sap.ui.xmlfragment("com.btc.terminal.fragment.DestInfoDetail", this);
				/*this.detailDestDialog.setModel(this.getModel("i18n"), "i18n");*/
				this.detailDestDialog.setModel(this.getModel("putAwayModel"), "putAwayModel");
				this.detailDestDialog.setModel(this.getModel());
				this.detailDestDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
			this.detailDestDialog.open();
		},
		diffConfirmPressed : function(oEvent){
			var pageModel = this.getModel("diffPageModel");
			var vActQ = pageModel.getProperty("/actQ");
			if(vActQ){
				//not empty
				var iAct = parseInt(vActQ);
				if(iAct>=0){
					 var putAwayModel =  this.getModel("putAwayModel");
					 pageModel.setProperty("/actQ",iAct.toString());
					 putAwayModel.setProperty("/DiffActualQuantity",iAct.toString());
					 
					 this.getRouter().navTo("destinationInfo",
					{
						HU : this.HU
					});
				}
				
			}
		},
		diffCheckPressed : function(oEvent){
			/*var inpActQ = this.getView().byId("")*/
			var putAwayActualAmount = this.formatter.setEinme(this.getModel("putAwayModel").getProperty("/Einme"));
			var iputAwayActual = parseInt(putAwayActualAmount);
			var pageModel = this.getModel("diffPageModel");
			var vActQ = pageModel.getProperty("/actQ");
			var vDiffQ = pageModel.getProperty("/destDiffQ");
			if(vActQ || vDiffQ){
				//ikisinden biri dolu
				if(vActQ && vDiffQ){
					//If Both fields are filled operations goes by destDiffInfo
					this.onlyDiffsetAction(iputAwayActual);
					
				}else{
					if(vActQ){
						var iAct = parseInt(vActQ);
						if(iAct<0){
							//Negative number Error
							pageModel.setProperty("/actQ","");
							pageModel.setProperty("/destDiffQ","");
							
						}else{
							//Actual isNot Negative
							var iDest = iputAwayActual - iAct;
							pageModel.setProperty("/destDiffQ",iDest.toString());
						}
						 
						
					}else{
						//nlyDiffsetAction
						this.onlyDiffsetAction(iputAwayActual);
					}
				}
			}else{
				//Number type if invalid values insed resets them
				pageModel.setProperty("/actQ",iputAwayActual.toString());
				var putAwayModel =  this.getModel("putAwayModel");
				putAwayModel.setProperty("/DiffActualQuantity","");
				pageModel.setProperty("/destDiffQ","");
			}
			
			
		},
		onlyDiffsetAction : function(iPutAwayActual){
			var pageModel = this.getModel("diffPageModel");
			var vDiffQ = pageModel.getProperty("/destDiffQ");
			var iDiff = parseInt(vDiffQ);
			var iAct = iPutAwayActual - iDiff;
			pageModel.setProperty("/actQ",iAct.toString());
			pageModel.setProperty("/destDiffQ",vDiffQ.toString());
		}
		

	});

});