sap.ui.define([
	"com/btc/terminal/controller/BaseController",
	"com/btc/terminal/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/m/Dialog"
], function(BaseController, formatter, JSONModel, MessageToast, Dialog) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.TransferToAddress", {

		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.btc.terminal.view.TransferToAddress
		 */
		onInit: function() {
			this.getRouter().getRoute("transferToAddress").attachPatternMatched(this._onRouteMatched, this);

		},
		_onRouteMatched: function(oEvent) {
			var transferModel = this.getTransferModel();
			if (!transferModel.getProperty("/Matnr")) {
				this.getRouter().navTo("transferToAddressSelect");
				return;
			}

			this.getValidDestinationInformation();
			var oViewModel;
			// Model used to manipulate control states
			oViewModel = new JSONModel({
				transferButtonEnabled: false,
				LgplaFound: false
			});
			this.setModel(oViewModel, "transferAddressViewModel");
		},
		getMyViewModel: function() {
			return this.getModel("transferAddressViewModel");
		},

		/**
		ilar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.btc.terminal.view.TransferToAddress
		 */
		onBeforeRendering: function() {

		},

		getValidDestinationInformation: function() {

			var transferModel = this.getTransferModel();
			var searchMatnr = transferModel.getProperty("/Matnr");
			var _this = this;
			var _myView = this.getView();
			var oModel = this.getModel();

			_myView.setBusy(true);
			var oCore = sap.ui.getCore();
			oCore.lock();
			oModel.callFunction("/TransferLgpadCheck", {
				urlParameters: {
					Matnr: searchMatnr
						//Lgtyp: searchLgtyp Default 313
				},
				method: "GET",
				success: function(oData, response) {
					oCore.unlock();
					_myView.setBusy(false);
					if (oData.Lgpla) {
						_this.setTransferLgpadCheckData(oData);
						_this.setViewLpglaFoundTo(true);

					} else {
						//Default Picking Addres Not Foun 
						_this.setTransferLgpadCheckData(oData); // sets values with empty records
						_this.setViewLpglaFoundTo(false);
					}

				},
				error: function(oError) {
					oCore.unlock();
					_myView.setBusy(false);
					_this.clearTransferLgplaData();
					var error_message = JSON.parse(oError.responseText).error.message.value;
					if (!error_message) {
						error_message = "Problem occured when reading default destination address";
					}
					_this.showMessageDialog("Error", error_message, "Error");
					MessageToast.show(error_message);
				}
			});

		},
		setTransferLgpadCheckData: function(oData) {
			var transferModel = this.getTransferModel();
			transferModel.setProperty("/LgpladValid", oData.Lgpla);
			transferModel.setProperty("/Lgberd", oData.Lgber);
			transferModel.setProperty("/Lgtypd", oData.Lgtyp);
			transferModel.setProperty("/Lgplad", oData.Lgpla);
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.btc.terminal.view.TransferToAddress
		 */
		onAfterRendering: function() {

		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.btc.terminal.view.TransferToAddress
		 */
		onExit: function() {

		},
		onNavBackToAddress: function() {
			this.getRouter().navTo("transferToAddressSelect");
		},
		onQuantityChange: function(oEvent) {
			var sQty = oEvent.getParameter("value");
			var quantInput = oEvent.getSource();
			if (sQty) {
				var transferModel = this.getTransferModel();
				var sUmrez = transferModel.getProperty("/Umrez");
				var iumrez = parseInt(sUmrez, 10);

				var iQty = parseInt(sQty, 10);
				if (iQty <= 0) {
					this.showMessageDialog("Error", "Quantity Can not be negative or zero", "Error");
					quantInput.setValue("");
					return;
				}
				var modUmrez = iQty % iumrez;
				if (modUmrez !== 0) {
					//this.showMessageDialog("Warning", "Quantity " + iQty + " is not divider of " + iumrez + "", "Warning");
					MessageToast.show("Quantity " + iQty + " is not divider of " + iumrez + "");

				}

			}
		},
		setViewLpglaFoundTo: function(oBool) {
			//setViewLpglaFoundTo && LgplaFound
			var viewModel = this.getMyViewModel();
			viewModel.setProperty("/LgplaFound", oBool);
		},
		onMoveQuantityChange: function(oEvent) {
			var viewModel = this.getMyViewModel();
			var destFound = viewModel.getProperty("/LgplaFound");
			var qtyValue = oEvent.getParameter("newValue");
			var transferModel = this.getTransferModel();
			var sValidLgpla = transferModel.getProperty("/LgpladValid");
			var vDest = transferModel.getProperty("/Lgplad");
			if (destFound) {
				if (vDest && sValidLgpla) {
					if (!qtyValue) {
						viewModel.setProperty("/transferButtonEnabled", false);
						return;
					} else {
						if (parseInt(qtyValue) < 0) {
							viewModel.setProperty("/transferButtonEnabled", false);
							return;
						}
						if (sValidLgpla === vDest) {
							//
							viewModel.setProperty("/transferButtonEnabled", true);
						} else {
							//
							viewModel.setProperty("/transferButtonEnabled", false);
						}
					}
				}
			} else {
				//
				if (vDest) {
					//
					if (!qtyValue) {
						viewModel.setProperty("/transferButtonEnabled", false);
						return;
					} else {
						if (parseInt(qtyValue) < 0) {
							viewModel.setProperty("/transferButtonEnabled", false);
							return;
						} else {
							viewModel.setProperty("/transferButtonEnabled", true);
						}

					}
				}
			}

		},

		clearTransferLgplaData: function() {
			var transferModel = this.getTransferModel();
			transferModel.setProperty("/Lgplad", "");
			transferModel.setProperty("/Lgberd", "");
			transferModel.setProperty("/Lgtypd", "");
			transferModel.setProperty("/LgpladValid", "");
		},
		onDestAddressEnter: function(oEvent) {
			var queryValue = oEvent.getParameter("query");
			if (queryValue) {
				//
				var transferModel = this.getTransferModel();
				var sValidLgpla = transferModel.getProperty("/LgpladValid");
				if (queryValue !== sValidLgpla) {
					this.showMessageDialog("Error", "Scanned Address does not match with the Default Address", "Error");
				}
			}
		},
		onDestinationAddressChange: function(oEvent) {
			var sLgpla = oEvent.getParameter("newValue");
			var destInput = oEvent.getSource();
			var viewModel = this.getMyViewModel();
			var destFound = viewModel.getProperty("/LgplaFound");
			if (sLgpla) {
				if (this.hasLowerCase(sLgpla)) {
					sLgpla = sLgpla.toUpperCase();
					destInput.setValue(sLgpla.toUpperCase());
				}
				var transferModel = this.getTransferModel();
				var sValidLgpla = transferModel.getProperty("/LgpladValid");
				var moveQty = transferModel.getProperty("/MoveQty");
				if (destFound) {
					if (sLgpla === sValidLgpla) {
						if (moveQty) {
							viewModel.setProperty("/transferButtonEnabled", true);
						} else {
							viewModel.setProperty("/transferButtonEnabled", false);
						}

					} else {
						viewModel.setProperty("/transferButtonEnabled", false);
					}
				}else{
					if(sLgpla){
						if (moveQty) {
							viewModel.setProperty("/transferButtonEnabled", true);
						} else {
							viewModel.setProperty("/transferButtonEnabled", false);
						}
					}else{
						viewModel.setProperty("/transferButtonEnabled", false);
					}
					
				}

			} else {
				viewModel.setProperty("/transferButtonEnabled", false);
			}

		},
		hasLowerCase: function(str) {
			return str.toUpperCase() !== str;
		},
		onTransfer: function(oEvent) {
			var _this = this;
			var _myView = this.getView();
			var oModel = this.getModel();
			var transferModel = this.getTransferModel();
			var oUrlParams = transferModel.getData();
			var viewModel = this.getMyViewModel();
			var destFound = viewModel.getProperty("/LgplaFound");
			//var sLgpla = transferModel.getProperty("/Lgpla");
			//var sLenum = transferModel.getProperty("/Lenum");
			var copiedUrl = jQuery.extend({}, oUrlParams);
			delete copiedUrl["Maktx"];
			delete copiedUrl["Meinh"];
			delete copiedUrl["LgpladValid"];
			_myView.setBusy(true);
			var oCore = sap.ui.getCore();
			oCore.lock();
			oModel.callFunction("/TransferToAddress", {
				urlParameters: copiedUrl,
				method: "POST",
				success: function(oData, response) {
					oCore.unlock();
					_myView.setBusy(false);
					if (oData.Type === "E") {
						_this.showMessageDialog("Error", oData.Message, sap.ui.core.ValueState.Error);
					} else {
						//_this.showMessageDialog("Successful", oData.Message, sap.ui.core.ValueState.Success);
						_this.getRouter().navTo("transferToAddressSelect");
						MessageToast.show("Transfer Operation Successfully completed ! ", {
							closeOnBrowserNavigation: false,
							duration: 4000

						});
					}

				},
				error: function(oError) {
					oCore.unlock();
					_myView.setBusy(false);
					var myresPonseText = JSON.parse(oError.responseText).error.message.value;
					_this.showMessageDialog("Error", myresPonseText, sap.ui.core.ValueState.Error);

				}
			});
		}

	});

});