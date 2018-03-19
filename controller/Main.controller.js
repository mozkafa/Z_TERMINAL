sap.ui.define([
	"com/btc/terminal/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.Main", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.btc.terminal.view.Main
		 */
		onInit: function() {
	//	var audio = document.getElementById("application-Test-url-component---app--idErrorSound");  
		
    	
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.btc.terminal.view.Main
		 */
		onBeforeRendering: function() {

		},
		keyPressed : function(evt){
			//alert(evt.keyCode);
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.btc.terminal.view.Main
		 */
		onAfterRendering: function() {
			var _this = this;
			$("#"+this.getView().getId()).keydown(function(evt){
    			/*evt.preventDefault();*/
    			_this.keyPressed(evt);
			});
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.btc.terminal.view.Main
		 */
		onExit: function() {
	
		},
		tilePressedPutaway : function(oEvent){
			this.getRouter().navTo("putAwayMain");
		},
		tilePressedTranfer : function(oEvent){
			this.getRouter().navTo("transferMain");
		},
		tilePressedOutput : function(oEvent){
			this.getRouter().navTo("outputMain");
		},
		tilePressedInquiries : function(oEvent){
			this.getRouter().navTo("inquiriesMain");
		},
		tilePressedInventory : function(oEvent){
			this.getRouter().navTo("inventoryMain");
		}

	});

});