sap.ui.define([
	"com/btc/terminal/controller/BaseController",
	"com/btc/terminal/model/formatter",
	"sap/m/MessageToast"
], function(BaseController, formatter,MessageToast) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.TransferToAddressSelect", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.btc.terminal.view.TransferToAddress
		 */

		onInit: function() {

			this.getRouter().getRoute("transferToAddressSelect").attachPatternMatched(this._onRouteMatched, this);

		},
		_onRouteMatched: function(oEvent) {
			//idInpLgplaSelect
			//idInpLgplaSelect
			this.clearTransferModel();
			this.focusOnInputWithIdAndInterval("idInpLgplaSelect", 500);
			this.searchedLgpla = null;
			
			//transferToAddresModel
		},
		
		onLgplaSearch: function(oEvent) {
			var bClearPressed = oEvent.getParameter("clearButtonPressed");
			var bRefreshPressed = oEvent.getParameter("refreshButtonPressed");
			var transferModel = this.getTransferModel();
			var sQuery = oEvent.getParameter("query");
			if (!(bClearPressed || bRefreshPressed) && sQuery) {
				//Some query Entry
				var _this = this;
				var _myView = this.getView();
				var oModel = this.getModel();
				var sValue = transferModel.getProperty("/Lgpla");
				_myView.setBusy(true);
				var oCore = sap.ui.getCore();
				oCore.lock();
				oModel.callFunction("/AdreesCheckTransfer", {
					urlParameters: {
						Lgpla: sValue
					},
					method: "GET",
					success: function(oData, response) {
						oCore.unlock();
						_myView.setBusy(false);
						if (oData.Lgpla) {
							_this.searchedLgpla = oData.Lgpla;
							_this.setAddressCheckData(oData);
							MessageToast.show("Address is Valid!");
							_this.focusOnInputWithIdAndInterval("idInpLenumSelect", 200);

						}

					},
					error: function(oError) {
						oCore.unlock();
						_myView.setBusy(false);
						_this.searchedLgpla = null;
					

					}
				});
			} else {
				//Values Changed
				transferModel.setProperty("/Lgpla", "");
				transferModel.setProperty("/Lgber", "");
			}

		},
		setAddressCheckData : function(oData){
			var transferModel = this.getTransferModel();
			transferModel.setProperty("/Lgpla", oData.Lgpla);
			transferModel.setProperty("/Lgber", oData.Lgber);
			
		},
		setAddressInfoData : function(oData){
			var transferModel = this.getTransferModel();
			
			transferModel.setProperty("/Lenum", oData.Lenum);
			transferModel.setProperty("/Matnr",oData.Matnr);
			transferModel.setProperty("/Maktx",oData.Maktx);
			transferModel.setProperty("/Werks",oData.Werks);
			transferModel.setProperty("/Lgort",oData.Lgort);
			if(oData.Verme){
			transferModel.setProperty("/Verme",parseFloat(oData.Verme).toString());	
			}else{
			transferModel.setProperty("/Verme",parseFloat(oData.Verme));
			}
			
			transferModel.setProperty("/Meins",oData.Meins);
			transferModel.setProperty("/Lgnum",oData.Lgnum);
			transferModel.setProperty("/Lgtyp",oData.Lgtyp);
			transferModel.setProperty("/Meinh",oData.Meinh);
			transferModel.setProperty("/Letyp",oData.Letyp);
			if(oData.Umrez){
				transferModel.setProperty("/Umrez",parseInt(oData.Umrez).toString());
			}else{
				transferModel.setProperty("/Umrez",oData.Umrez);
			}
			
			
		},
		onLenumSearch: function(oEvent) {
			var bClearPressed = oEvent.getParameter("clearButtonPressed");
			var bRefreshPressed = oEvent.getParameter("refreshButtonPressed");
			var transferModel = this.getTransferModel();
			var searchedLgpla = transferModel.getProperty("/Lgpla");
			var sQuery = oEvent.getParameter("query");
			if (!(bClearPressed || bRefreshPressed) && sQuery) {
				//
				if (searchedLgpla === this.searchedLgpla) {
					//
					var _this = this;
					var _myView = this.getView();
					var oModel = this.getModel();
					var sLgpla = transferModel.getProperty("/Lgpla");
					var sLenum = transferModel.getProperty("/Lenum");
					_myView.setBusy(true);
					var oCore = sap.ui.getCore();
					oCore.lock();
					oModel.callFunction("/TransferAdressInfoGet", {
						urlParameters: {
							Lgpla: sLgpla,
							Lenum: sLenum
						},
						method: "GET",
						success: function(oData, response) {
							oCore.unlock();
							_myView.setBusy(false);
							if (oData.Lgpla) {
								//
								_this.setAddressInfoData(oData);
								_this.getRouter().navTo("transferToAddress");
								MessageToast.show("Storage Unit Read Successful!");
							}

						},
						error: function(oError) {
							oCore.unlock();
							_myView.setBusy(false);
							//_this.searchedLgpla = null;
							//_this.showMessageDialog("Error", JSON.parse(oError.responseText).error.innererror.errordetails[0].message , sap.ui.core.ValueState.Error);
							MessageToast.show(JSON.parse(oError.responseText).error.innererror.errordetails[0].message);
							_this.clearInputs();
							_this.focusOnInputWithIdAndInterval("idInpLgplaSelect", 500);
							
							
						}
					});
				} else {
					//Searched Lgpla Has Changed clear Model end inputs and direct to Lgpla input 
					this.clearInputs();
					this.focusOnInputWithIdAndInterval("idInpLgplaSelect", 100);
				}
			} else {
				//Do nothing Lenum Field Refreshed or cleard or searched with empty input
			}

		},
		onNavBackToTransferMain : function(){
			this.getRouter().navTo("transferMain");
		},
		clearInputs: function() {
			var transferToAddresModel = this.getTransferModel();
			//var transferToAddresModel = this.getView().getModel("TransferAddressModel");
			var transferToAddressData = {
				Lgpla: "",
				Lgber: "",
				Lgberd:"",
				Lenum: "",
				Matnr: "",
				Maktx: "",
				Werks: "",
				Lgort: "",
				Verme: null,
				Lgplad: "",
				Lgnum: "",
				Lgtyp: "",
				Lgtypd:"",
				Meins: "",
				Meinh: "",
				Umrez: "",
				MoveQty: "",
				Letyp: "",
				LgpladValid:""
			};
			transferToAddresModel.setData(transferToAddressData);
		},
		focusOnInputWithIdAndInterval: function(iId, iValue) {
			/*idInpSu*/
			var firstInput = this.getView().byId(iId);
			setTimeout(function() {
				//myinput.focus();
				setTimeout(function() {
					firstInput.focus();
				}, iValue);
			}, iValue);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.btc.terminal.view.TransferToAddress
		 */
		onBeforeRendering: function() {

		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.btc.terminal.view.TransferToAddress
		 */
		onAfterRendering: function() {
			this.clearInputs();
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.btc.terminal.view.TransferToAddress
		 */
		onExit: function() {

		}

	});

});