sap.ui.define([
		"sap/ui/base/Object",
		"sap/m/MessageBox",
		"com/btc/terminal/model/DefinedErrors"
	], function (UI5Object, MessageBox,DefinedErrors) {
		"use strict";

		return UI5Object.extend("com.btc.terminal.controller.ErrorHandler", {

			/**
			 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
			 * @class
			 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
			 * @public
			 * @alias com.btc.terminal.controller.ErrorHandler
			 */
			myDefinedErrors : DefinedErrors.errorData,
			constructor : function (oComponent) {
				this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
				this._oComponent = oComponent;
				this._oModel = oComponent.getModel();
				this._bMessageOpen = false;
				this._sErrorText = this._oResourceBundle.getText("errorText");

				this._oModel.attachMetadataFailed(function (oEvent) {
					var oParams = oEvent.getParameters();
					this._showServiceError(oParams.response);
				}, this);

				this._oModel.attachRequestFailed(function (oEvent) {
					var oParams = oEvent.getParameters();
					// An entity that was not found in the service is also throwing a 404 error in oData.
					// We already cover this case with a notFound target so we skip it here.
					// A request that cannot be sent to the server is a technical error that we have to handle though
					//oParams.url === "InventoryCheckSet" ||
					if( oParams.url.indexOf("MateriaByAddress?Matnr") !== -1 || oParams.url.indexOf("TransferToAddress?Lgpla") !== -1  ||  oParams.url.indexOf("TransferAdressInfoGet?Lgpla") !== -1){
						//No actions should be done in Error handler . It will be handled in 
					}
					else if (oParams.response.statusCode !== "404" || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf("Cannot POST") === 0)) {
						var myresPonseText = JSON.parse(oParams.response.responseText).error.message.value;
						var isIdentified = this.checkIfIdentifiedError(myresPonseText);
						if(!isIdentified){
							this._showServiceError(oParams.response);
						}
						
					}
				}, this);
			},
			checkIfIdentifiedError : function(oError){
				
				if (this.myDefinedErrors.indexOf(oError) === -1) {
					return false;
				}
				return true;
			},
			/**
			 * Shows a {@link sap.m.MessageBox} when a service call has failed.
			 * Only the first error message will be display.
			 * @param {string} sDetails a technical error to be displayed on request
			 * @private
			 */
			_showServiceError : function (sDetails) {
				if (this._bMessageOpen) {
					return;
				}
				this._bMessageOpen = true;
				MessageBox.error(
					this._sErrorText,
					{
						id : "serviceErrorMessageBox",
						details: sDetails,
						styleClass: this._oComponent.getContentDensityClass(),
						actions: [MessageBox.Action.CLOSE],
						onClose: function () {
							this._bMessageOpen = false;
						}.bind(this)
					}
				);
			}
		});
	}
);