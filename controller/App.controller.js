sap.ui.define([
	"com/btc/terminal/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.App", {

		onInit: function() {
			var oController = this;
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			var putAwayModel = new JSONModel({});
			this.setModel(putAwayModel, "putAwayModel");

			var wholeSalesModel = new sap.ui.model.json.JSONModel({
				Barcode: ""
			});
			this.setModel(wholeSalesModel, "wholeSalesModel");
			
			
			var invManagementModel = new JSONModel({});
			this.setModel(invManagementModel, "inventoryModel");
			
			var transferToAddressModel = new JSONModel({});
			this.setModel(transferToAddressModel,"TransferAddressModel");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
				// After Reaching Metada Get Audio Files
				//oController.setAudioParameters();
			};

			this.getOwnerComponent().getModel().metadataLoaded().
			then(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});

});