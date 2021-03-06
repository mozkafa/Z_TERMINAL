sap.ui.define([
	"com/btc/terminal/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.InventoryMain", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.btc.terminal.view.InventoryMain
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.btc.terminal.view.InventoryMain
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.btc.terminal.view.InventoryMain
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.btc.terminal.view.InventoryMain
		 */
		//	onExit: function() {
		//
		//	}
		tilePressedInventory : function(oEvent){
			//inventory Clisked
			this.getRouter().navTo("inventorySelect");
		},
		onNavBackInvMain : function(oEvent){
			this.getRouter().navTo("main");
		}

	});

});