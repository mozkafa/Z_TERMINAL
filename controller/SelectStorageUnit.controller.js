sap.ui.define([
	"com/btc/terminal/controller/BaseController",
	"com/btc/terminal/model/formatter"
], function(BaseController, formatter) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.SelectStorageUnit", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.btc.terminal.view.SelectStorageUnit
		 */
		formatter: formatter,
		onInit: function() {
			this.getRouter().getRoute("selectStorageUnit").attachPatternMatched(this._onRouteMatched, this);
			var myinput = this.getView().byId("idSuBarcode").addEventDelegate({
				onAfterRendering: function() {
					/*jQuery.sap.delayedCall(400, this, function() {
    			myinput.focus();
			});*/
					setTimeout(function() {
						myinput.focus();
					}, 500);
				}
			});
		},
		_onRouteMatched: function(oEvent) {
			/*var parameters = oEvent.getParameter("arguments");*/

			var HUModel = new sap.ui.model.json.JSONModel();
			HUModel.setData({
				barcodeNo: ""
			});
			this.getView().setModel(HUModel, "HUModel");
			var putAwayModel = this.getModel("putAwayModel");
			putAwayModel.setData();
			this.focusOnBarcodeInput();

		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.btc.terminal.view.SelectStorageUnit
		 */
		onBeforeRendering: function() {

		},
		focusOnBarcodeInput: function() {

			var myinput = this.getView().byId("idSuBarcode");
			setTimeout(function() {
				myinput.focus();
			}, 500);
			
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.btc.terminal.view.SelectStorageUnit
		 */
		onAfterRendering: function() {
			/*this.focusOnBarcodeInput();*/

		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.btc.terminal.view.SelectStorageUnit
		 */
		onExit: function() {

		},
		onSuInputLiveChange: function(oEvent) {
			var suValue = oEvent.getParameter("newValue");
			if (suValue) {
				if (suValue.length === 10) {
					//Valid HU Numeber
					this.prepareForNextStep(suValue);
				}
			}
		},
		prepareForNextStep: function(sValue) {
			var _this = this;
			var _myView = this.getView();
			var putAwayModel = _this.getModel("putAwayModel");
			var oBundle = this.getResourceBundle();
			var oModel = this.getView().getModel();
			var sReadPath = "/DestInfoSet('" + sValue + "')";
			_myView.setBusy(true);
			oModel.read(sReadPath, { // chacks the validty of the sValue
				success: function(oData, response) {
					_myView.setBusy(false);
					putAwayModel.setData(oData);
					putAwayModel.setProperty("/DiffActualQuantity", ""); //** Onemli
					_this.getRouter().navTo("destinationInfo", {
						HU: oData.Lenum
					});
				},
				error: function(oError) {
					_myView.setBusy(false);
					putAwayModel.setData();
					var myresPonseText = JSON.parse(oError.responseText).error.message.value;
					switch (myresPonseText) {
						case "NOTEXIST":
							_this.showMessageDialog(_this.getResourceBundle().getText("huMessage"), oBundle.getText(myresPonseText, [sValue]), sap.ui.core
								.ValueState.Warning);
							break;
						case "SU_IS_LOCKED":
							_this.showMessageDialog(_this.getResourceBundle().getText("huMessage"), oBundle.getText(myresPonseText, [sValue]), sap.ui.core
								.ValueState.Warning);
							break;
						case "TO_IS_CONFIRMED":
							_this.showMessageDialog(_this.getResourceBundle().getText("huMessage"), oBundle.getText(myresPonseText, [sValue]), sap.ui.core
								.ValueState.Warning);
							break;
						default:
							_this.showMessageDialog(_this.getResourceBundle().getText("huMessage"), oBundle.getText(myresPonseText), sap.ui.core.ValueState
								.Warning);
							break;
					}
					/*	if(myresPonseText === "NOTEXIST"){ // Backend Defined Error Messages not displayed by ErrorHandler.js check function "checkIfIdentifiedError" in ErrorHandler
							_this.showMessageDialog(_this.getResourceBundle().getText("huMessage"),oBundle.getText("NOTEXIST", [sValue]),sap.ui.core.ValueState.Warning);
						}*/

				}
			});

		},
		onNext: function(oEvent) {
			var myHuModel = this.getView().getModel("HUModel");
			if (myHuModel) {
				var mybarcodeNo = myHuModel.getProperty("/barcodeNo");
				if (mybarcodeNo) {
					if (mybarcodeNo.length === 10 && $.isNumeric(mybarcodeNo)) {
						//Valid HU Numeber
						this.prepareForNextStep(mybarcodeNo);
					}
				}
			}
		},
		onClearHU: function(oEvent) {
			var myModel = this.getView().getModel("HUModel");
			myModel.setProperty("/barcodeNo", "");

		}

	});

});