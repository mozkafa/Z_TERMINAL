sap.ui.define([
	"com/btc/terminal/controller/BaseController",
	"com/btc/terminal/model/formatter"
], function(BaseController, formatter) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.InventorySelect", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.btc.terminal.view.InventorySelect
		 */
		formatter: formatter,
		onInit: function() {
			this.getRouter().getRoute("inventorySelect").attachPatternMatched(this._onRouteMatched, this);
			var myinput = this.getView().byId("idInventoryInput").addEventDelegate({
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

			var invSelect = new sap.ui.model.json.JSONModel();
			invSelect.setData({
				Lgpla: ""
			});
			this.getView().setModel(invSelect, "InventorySelectModel");
			/*	var putAwayModel = this.getModel("putAwayModel");
				putAwayModel.setData();*/
			this.getModel("inventoryModel").setData();
			this.focusOnInvInput();

		},
		focusOnInvInput: function() {

			var myinput = this.getView().byId("idInventoryInput");
			setTimeout(function() {
				myinput.focus();
			}, 500);
		},
		onInvInputLiveChange: function(oEvent) {
			/*if (this.checkInvNumber()) {
				this.prepareForNextStep();
			}*/
		},
		onNavBackIS:function(oEvent){
				this.getRouter().navTo("inventoryMain");
		},
		checkInvNumber: function() {
			var invModel = this.getView().getModel("InventorySelectModel");
			var invNumber = invModel.getProperty("/Lgpla");
			if (invNumber) {
				if (invNumber.length <= 10) {
					return true;
				}
			}
			return false;
		},
		onInvNumSearch: function(oEvent) {
			if (this.checkInvNumber()) {

				this.prepareForNextStep();
			}
		},
		setInventoryModelWithoData: function(oData) {
			var inventoryModelG = this.getModel("inventoryModel");
			var invData = {
				ItemCount : oData.ItemCount,
				Lgpla: oData.Lgpla,
				Lgnum: oData.Lgnum,
				Lgtyp: oData.Lgtyp,
				Lenvw: oData.Lenvw,
				Lgber: oData.Lgber,
				VermeTotal:oData.VermeTotal,
				Matnr: "",
				StorageUnit: "",
				Maktx: "",
				Quantity: ""

			};
			inventoryModelG.setData(invData);
			this.getRouter().navTo("inventoryOperation", {
				InventoryNumber: oData.Lgpla
			});
		},
		prepareForNextStep: function() {
			var _this = this;
			var _myView = this.getView();
			var oModel = this.getView().getModel();
			var invModel = this.getView().getModel("InventorySelectModel");
			var sValue = invModel.getProperty("/Lgpla");
			_myView.setBusy(true);
				var oCore = sap.ui.getCore();
				oCore.lock();
				oModel.callFunction("/InventoryCheck", {
					urlParameters: {
						Lgpla: sValue
					},
					method: "GET",
					success: function(oData, response) {
						oCore.unlock();
						_myView.setBusy(false);
						var screen = oData.Screen;
						if (screen !== 0) {
							_this.setInventoryModelWithoData(oData);
						} else {
							_this.showMessageDialog("Error", oData.Message + "!", "Error");
						}
					},
					error: function(oError) {
						oCore.unlock();
						_myView.setBusy(false);
						var myresPonseText = JSON.parse(oError.responseText).error.message.value;

					}
				});
			//}

		},
		onInventoryNext: function(oEvent) {
			var myHuModel = this.getView().getModel("InventoryModel");
			if (myHuModel) {
				var mybarcodeNo = myHuModel.getProperty("/Lgpla");
				if (mybarcodeNo) {
					if (mybarcodeNo.length <= 10) {
						//Valid HU Numeber
						this.prepareForNextStep(mybarcodeNo);
					}
				}
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.btc.terminal.view.InventorySelect
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.btc.terminal.view.InventorySelect
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.btc.terminal.view.InventorySelect
		 */
		//	onExit: function() {
		//
		//	}

	});

});