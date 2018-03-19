sap.ui.define([
	"com/btc/terminal/controller/BaseController",
	"com/btc/terminal/model/formatter"
], function(BaseController, formatter) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.TransferOrderCreate", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.btc.terminal.view.TransferOrderCreate
		 */
		RenderStat: null,
		formatter: formatter,
		onInit: function() {

			this.getRouter().getRoute("transferOrderCreate").attachPatternMatched(this._onRouteMatched, this);

		},
		_onRouteMatched: function(oEvent) {
			var that = this;
			var HUModel = new sap.ui.model.json.JSONModel();
			HUModel.setData({
				Lenum: ""
			});
			this.getView().setModel(HUModel, "HUModel");

			var messageModel = new sap.ui.model.json.JSONModel();
			messageModel.setData({
				messageList: ""
			});
			this.getView().setModel(messageModel, "messageModel");
			//if (this.RenderStat) {
			this.focusOnBarcodeInput();
			//}
			var items = this.getView().byId("idSimpleForm").getContent();
			var firstInput = this.getView().byId("idInpSu");
			var secondInput = this.getView().byId("idStorageBin");
			firstInput.addEventDelegate({
				onAfterRendering: function() {
					var firstId = firstInput.getId();
					$("#" + firstId).find("input").on("focus", function() {
						that.showOnlyFirstInput(items);
					});

					var secondId = secondInput.getId();
					$("#" + secondId).find("input").on("focus", function() {
						that.hideOnlyFirstInput(items);
					});

				}
			});

			secondInput.addEventDelegate({
				onAfterRendering: function() {

					var secondId = secondInput.getId();
					$("#" + secondId).find("input").on("focus", function() {
						that.hideOnlyFirstInput(items);
					});
					$("#" + secondId).find("input").on("blur", function() {

						that.showButton(items);

					});
				}
			});
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.btc.terminal.view.TransferOrderCreate
		 */
		focusOnBarcodeInput: function() {
			/*idInpSu*/
			var firstInput = this.getView().byId("idInpSu");
			var items = this.getView().byId("idSimpleForm").getContent();
			var _this = this;
			setTimeout(function() {
				_this.getView().getController().showOnlyFirstInput(items);
				//myinput.focus();
				setTimeout(function() {
					firstInput.focus();
				}, 500);
			}, 500);
		},

		showOnlyFirstInput: function(items) {
			var arr = ["0", "1", "2", "4", "7", "12"];
			for (var i in items) {

				if (arr.indexOf(i) == -1) {
					items[i].setVisible(false);
				} else {
					items[i].setVisible(true);
				}

			}
		},
		hideOnlyFirstInput: function(items) {
			var arr = ["0", "1", "12", "13"];
			for (var i in items) {
				if (arr.indexOf(i) != -1) {
					items[i].setVisible(false);
				} else {
					items[i].setVisible(true);
				}
			}
		},
		showButton: function(items) {
			for (var i in items) {
				items[i].setVisible(true);
			}
		},
		setVisibleAllInput: function(items) {

			for (var i in items) {
				items[i].setVisible(true);
			}
		},

		onBeforeRendering: function() {
			this.RenderStat = false;
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.btc.terminal.view.TransferOrderCreate
		 */
		onAfterRendering: function() {
			
			var _this = this;
			if(!this.RenderStat){
				$("#" + this.getView().getId()).unbind('keydown');
				$("#" + this.getView().getId()).keydown(function(evt) {
				_this.keyPressed(evt);
			});
			}
			this.RenderStat = true;
			
		},
		keyPressed: function(evt) {
			var firstInput = this.getView().byId("idInpSu");
			var _this = this;
			if (evt.keyCode == 13) {
				if (!firstInput.getVisible()) {
					_this.onNext();
				}else{
					var HUModel = _this.getView().getModel("HUModel");
					var Lenum = HUModel.getProperty("/Lenum");
					var Lgpla = HUModel.getProperty("/Lgpla");
					var Lgtyp = HUModel.getProperty("/Lgtyp");
					if(Lenum && Lgpla && Lgtyp){
						_this.onNext();
					}
				}
			}
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.btc.terminal.view.TransferOrderCreate
		 */
		onExit: function() {

		},
		onGuide: function(value) {
			var that = this;
			var oModel = this.getView().getModel();
			var HUModel = this.getView().getModel("HUModel");
			//var value = HUModel.getProperty("/Lenum");

			if (value && value.length >= 10) {
				value.trim();
				this.getView().setBusy(true);
				oModel.read("/TransferOrderGuideSet('" + value + "')", {
					success: function(oData) {
						that.getView().setBusy(false);

						//that.getView().byId("idStorageBin").focus();
						if (oData.ReturnType == "E") {
							//sap.m.MessageToast.show(oData.ReturnMessage);
							that.showMessageDialog("Hata", oData.ReturnMessage, sap.ui.core.ValueState.Warning);
							that.onClearScreen();
						} else {
							var firstInputId = that.getView().byId("idInpSu").getId();
							$("#" + firstInputId).find("input").blur();

							var items = that.getView().byId("idSimpleForm").getContent();
							var secondInputId = that.getView().byId("idStorageBin").getId();
							that.setVisibleAllInput(items);

							setTimeout(function() {
								$("#" + secondInputId).find("input").focus();
							}, 50);
							HUModel.setData(oData);
						}
					},
					error: function(oError) {
						that.getView().setBusy(false);
					}
				});
			} else {
				HUModel.setData({});
			}
		},
		onDestBinChange : function(oEvent){
			var value = oEvent.getParameter("value");
			var HUModel = this.getView().getModel("HUModel");
			HUModel.setProperty("/Lgpla",value.toUpperCase());
			//value = value.toUpperCase();
		},
		onSUChange: function(oEvent) {
			var value = oEvent.getParameter("value");
			this.onGuide(value);
		},
		onNext: function(oEvent) {
			var _this = this;
			var oBundle = this.getResourceBundle();
			var oModel = this.getView().getModel();
			var HUModel = this.getView().getModel("HUModel");
			var messageModel = this.getView().getModel("messageModel");

			var Lenum = HUModel.getProperty("/Lenum");
			var Lgpla = HUModel.getProperty("/Lgpla");
			var Lgtyp = HUModel.getProperty("/Lgtyp");

			/*var dialog = new sap.m.Dialog({
				title: oBundle.getText("Result"),
				content: new sap.m.VBox({
					items: [
						new sap.m.List({
							items: {
								path: "messageModel>/messageList/",
								template: new sap.m.CustomListItem({
									content: [
										new sap.m.MessageStrip({
											showIcon: true,
											type: {
												path: 'messageModel>Type',
												formatter: formatter.setMessageType
											},
											text: "{messageModel>Message}"
										})
									]
								})
							}
						})
					]
				}),
				beginButton: new sap.m.Button({
					text: oBundle.getText("Okay"),
					press: function() {
						dialog.close();
						_this.onClearScreen();
					}
				})
			});*/
			this.getView().setBusy(true);
			oModel.callFunction("/TransferOrderCreate", {
				urlParameters: {
					Lenum: Lenum,
					Lgpla: Lgpla,
					Lgtyp: Lgtyp
				},
				method: "GET",
				success: function(oData) {
					/*messageModel.setProperty("/messageList", oData.results);
					dialog.setModel(messageModel, "messageModel");
					dialog.open();*/
					_this.getView().setBusy(false);
					if (oData.results.length > 0) {
						
						if(oData.results[0].Type === "S"){
							sap.m.MessageToast.show(oData.results[0].Message, {
								duration: 7000,
								my: sap.ui.core.Popup.Dock.CenterTop,             // default
								at: sap.ui.core.Popup.Dock.CenterTop             // default
							});
							_this.onClearScreen();
						}else{
							sap.m.MessageToast.show("Error:" + oData.results[0].Message, {
								duration: 7000,
								my: sap.ui.core.Popup.Dock.CenterTop,             // default
								at: sap.ui.core.Popup.Dock.CenterTop 
							});
						}
					}else{
						sap.m.MessageToast.show("In valid values.No operation can be performed", {
								duration: 7000,
								my: sap.ui.core.Popup.Dock.CenterTop,             // default
								at: sap.ui.core.Popup.Dock.CenterTop 
							});
					}
				},
				error: function(oError) {
					_this.getView().setBusy(false);
					sap.m.MessageToast.show("Error From Service", {
								duration: 7000,
								my: sap.ui.core.Popup.Dock.CenterTop,             // default
								at: sap.ui.core.Popup.Dock.CenterTop 
							});
				}
			});
		},
		onClearScreen: function(oEvent) {
			var HUModel = this.getView().getModel("HUModel");
			HUModel.setData({});
			var items = this.getView().byId("idSimpleForm").getContent();
			var firstInput = this.getView().byId("idInpSu");
			this.showOnlyFirstInput(items);
			setTimeout(function() {
				firstInput.focus();
			}, 500);

		}

	});

});