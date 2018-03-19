sap.ui.define([
	"com/btc/terminal/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.NewWholeSalesAudit", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.btc.terminal.view.NewWholeSalesAudit
		 */
		RenderStat: null,
		//audio : document.getElementsByTagName("audio")[0],
		onInit: function() {
			var myinput = this.getView().byId("idInpBarcode").addEventDelegate({
				onAfterRendering: function() {
					/*jQuery.sap.delayedCall(400, this, function() {
    			myinput.focus();
			});*/
					setTimeout(function() {
						myinput.focus();
					}, 500);
				}
			});
			this.getRouter().getRoute("newWholeSalesAudit").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function() {
			var wholeSalesModel = this.getView().getModel("wholeSalesModel");
			wholeSalesModel.setProperty("/Barcode","");
			
			if (this.RenderStat) {
				this.focusOnBarcodeInput();
			}
		},
		focusOnBarcodeInput: function() {
			var myinput = this.getView().byId("idInpBarcode");
			setTimeout(function() {
				myinput.focus();
			}, 500);
		},
		onBeforeRendering: function() {
			this.RenderStat = false;
		},
		onAfterRendering: function() {
			this.RenderStat = true;
			this.setAudioParameters();
		},
		onBarcodeSearch: function(oEvent) {
			this.stopAudioMessages();
			
			this.onBarcodeCheck("");
		},
		onBack: function(){
			this.getRouter().navTo("main", {}, true);
		}

	});

});