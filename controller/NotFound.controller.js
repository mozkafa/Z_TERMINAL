sap.ui.define([
		"com/btc/terminal/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("com.btc.terminal.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);