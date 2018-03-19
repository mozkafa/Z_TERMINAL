sap.ui.define([
	"com/btc/terminal/controller/BaseController",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/MessageToast",
	"com/btc/terminal/model/formatter"
], function(BaseController,Popover,Button,MessageToast,formatter) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.DestinationInformation", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.btc.terminal.view.DestinationInformation
		 */
		 formatter : formatter,
		onInit: function() {
				this.getRouter().getRoute("destinationInfo").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched : function(oEvent){
			var parameters = oEvent.getParameter("arguments");
			var myHU = parameters.HU;
			
			var putAwayModel = this.getModel("putAwayModel");
			var putAwayData = putAwayModel.getData();
			if(putAwayData){
				this.myHU = myHU;
			}
			else{
				this.navToMain();
			}
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.btc.terminal.view.DestinationInformation
		 */
		onBeforeRendering: function() {
		
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.btc.terminal.view.DestinationInformation
		 */
		onAfterRendering: function() {
		
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.btc.terminal.view.DestinationInformation
		 */
		onExit: function() {
	
		},
		onActionsPressed: function (oEvent) {
			var oButton = oEvent.getSource();
 
			// create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment(
					"com.btc.terminal.fragment.ActionSheet",
					this
				);
				this.getView().addDependent(this._actionSheet);
			}
 
			this._actionSheet.openBy(oButton);
		},
		onActionDetailPress : function(oEvent){
			if (!this.detailDestDialog) {
				this.detailDestDialog = new sap.ui.xmlfragment("com.btc.terminal.fragment.DestInfoDetail", this);
				/*this.detailDestDialog.setModel(this.getModel("i18n"), "i18n");*/
				this.detailDestDialog.setModel(this.getModel("putAwayModel"), "putAwayModel");
				this.detailDestDialog.setModel(this.getModel());
				this.detailDestDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
			this.detailDestDialog.open();
		},
		closeDetailDialog: function(oEvent){
			this.detailDestDialog.close();
		},
		onActionDiffPress : function(oEvent){
			
			this.getRouter().navTo("destinationDiff",
					{
						HU : this.myHU
					});
			/*MessageToast.show(oEvent.getSource().getText() + " pressed");*/
		},
		saveButtonPress : function(oEvent){
				var oModel = this.getView().getModel();
				var _this = this;
				var oBundle = this.getResourceBundle();
				var myModel = this.getModel("putAwayModel");
				var myLenum = myModel.getProperty("/Lenum");
				var myEinme = myModel.getProperty("/Einme");
				var myDiffActual = myModel.getProperty("/DiffActualQuantity");
				if(myDiffActual){
					if(parseInt(myEinme) === parseInt(myDiffActual)){
						myDiffActual="";
					}
				}
				this.getView().setBusy(true);

				oModel.callFunction("/ConfirmPutAwaySU", {
				urlParameters: {
					Lenum: myLenum,
					Einme: myEinme,
					DiffActual : myDiffActual
					
				},
				method: "GET",
				success: function(oData,response) {
					_this.getView().setBusy(false);
					var rMessage = oData.results[0].Message;
					var rType = oData.results[0].Type ;
					if(rType === "E"){
						
						_this.showMessageDialog(_this.getResourceBundle().getText("UNSUCCESSFULL_OPERATION_TITLE"),oBundle.getText(rMessage, [myLenum]),sap.ui.core.ValueState.Error);
						_this.getRouter().navTo("selectStorageUnit");
						
					}else{
						//
						_this.showMessageDialog(_this.getResourceBundle().getText("SUCCESSFULL_OPERATION_TITLE"),oBundle.getText(rMessage, [myLenum]),sap.ui.core.ValueState.Success);
						_this.getRouter().navTo("selectStorageUnit");
						
					}
				},
				error: function(oError) {
					_this.getView().setBusy(false);
					var myresPonseText = JSON.parse(oError.responseText).error.message.value;
					_this.showMessageDialog(_this.getResourceBundle().getText("huMessage"),oBundle.getText(myresPonseText, [myLenum]),sap.ui.core.ValueState.Warning);
					
				}
			});
		}
		

	});

});