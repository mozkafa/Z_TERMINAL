sap.ui.define([
	"com/btc/terminal/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.NewWholeSalesAuditDetail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.btc.terminal.webapp.view.NewWholeSalesAuditDetail
		 */
		RenderStat: null,
		audio: document.getElementsByTagName("audio")[0],
		onInit: function() {
			//idInpPackage
			var myinput = this.getView().byId("idInpMatnr").addEventDelegate({ // idInpMatnr   idInpPackage
				onAfterRendering: function() {
					/*jQuery.sap.delayedCall(400, this, function() {
                                               myinput.focus();
                                               });*/
					setTimeout(function() {
						myinput.focus();
					}, 1100);
				}
			});
			this.getRouter().getRoute("wholeSalesAuditDetail").attachPatternMatched(this._onRouteMatched, this);
		},
		focusOnPackage: function(iValue) {
			/*idInpSu*/
			var firstInput = this.getView().byId("idInpPackage");
			var _this = this;
			setTimeout(function() {
				//myinput.focus();
				setTimeout(function() {
					firstInput.focus();
				}, iValue);
			}, iValue);
		},
		_onRouteMatched: function(oEvent) {
			var wholeSalesModel = this.getView().getModel("wholeSalesModel");
			this.checkedMatnr = "";
			var TruckNo = wholeSalesModel.getProperty("/TruckNo");
			if (TruckNo == undefined) {
				var parameters = oEvent.getParameter("arguments");
				var barcode = parameters.Barcode;
				this.onBarcodeCheck(barcode);
			}
			if (this.RenderStat) {
				//this.focusOnBarcodeInput();
				this.focusOnMatnrInput(1000);

			}
		},
		getHUListView: function(oEvent) {
			var wholeSalesModel = this.getView().getModel("wholeSalesModel");
			var barcode = wholeSalesModel.getProperty("/Barcode");

			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment("popoverNavCon", "com.btc.terminal.fragment.HandlingUnitList", this);
				this.getView().addDependent(this._valueHelpDialog);
			}

			this._valueHelpDialog.bindAggregation("items", {
				path: "/HUListSet",
				template: new sap.m.ObjectListItem({
					title: "{Exidv}",
					//description : "{Matnr}",
					type: "Active",
					attributes: [
						new sap.m.ObjectAttribute({
							text: "{Matnr}"
						}),
						new sap.m.ObjectAttribute({
							text: "{Maktx}"
						})
					]
				}),
				filters: [new sap.ui.model.Filter("Barcode", sap.ui.model.FilterOperator.EQ, barcode)]
			});

			this._valueHelpDialog.open();

		},
		_handleValueHelpConfirm: function(oEvent) {

			var exidv = oEvent.getParameter("selectedItem").getBindingContext().getObject().Exidv;
			var matnr = oEvent.getParameter("selectedItem").getBindingContext().getObject().Matnr;
			var wholeSalesModel = this.getView().getModel("wholeSalesModel");
			wholeSalesModel.setProperty("/Exidv", exidv);
			wholeSalesModel.setProperty("/Matnr", matnr);
		},

		onReadHU: function(oEvent) {
			var wholeSalesModel = this.getView().getModel("wholeSalesModel");
			var newComingMatnr = wholeSalesModel.getProperty("/Matnr");
			if (wholeSalesModel.getProperty("/Exidv").length == 0) {
				return;
			}
			if (this.checkedMatnr === newComingMatnr) {
				this.onRead(wholeSalesModel.getProperty("/Exidv"));
			} else {
				// check matnr again
				this.onReadMaterialNo();

			}

		},
		onReadMaterialNo: function() {
			this.stopAudioMessages();
					
			var wholeSalesModel = this.getView().getModel("wholeSalesModel");
			var matnr = wholeSalesModel.getProperty("/Matnr");
			matnr = matnr.replace(/^0+/, '');
			wholeSalesModel.setProperty("/Matnr", matnr);
			if (matnr) {

				//DB ye gidip MARA dan alıyordu. 
				//02.02.2018 Local Check ile ZWM_T_WAVE_04 tablosundaki material No ya bakıyoruz.
				//this.checkMatnr(matnr); s.replace(/^0+/, '');
				this.checkMatnrLocal(matnr.replace(/^0+/, ''));

			} else {
				//Matnr Empty
				wholeSalesModel.setProperty("/Matnr", "");
				wholeSalesModel.setProperty("/MatnrCheck", false);
				wholeSalesModel.setProperty("/Exidv", "");
			}
		},
		doesMaterialExist: function(vMatnr) {
			var wholeSalesModel = this.getView().getModel("wholeSalesModel");
			var wholeSalesObject = wholeSalesModel.getData();
			var pickingItemsArr = wholeSalesObject.ToPickingItems.results;
			for (var i = 0; i < pickingItemsArr.length; i++) {
				var item = pickingItemsArr[i];
				if (item.Matnr === vMatnr) {
					return i;

				}
			}
			return -1;
		},
		checkMatnrLocal: function(vMatnr) {
			var wholeSalesModel = this.getView().getModel("wholeSalesModel");
			var wholeSalesObject = wholeSalesModel.getData();
			var pickingItemsArr = wholeSalesObject.ToPickingItems.results;
			var indexMat = this.doesMaterialExist(vMatnr);
			if (indexMat !== -1) {
				//
				this.playTerminalAudio(this.GL_SUCCESS);
				var selectedItem = pickingItemsArr[indexMat];

				wholeSalesModel.setProperty("/MatnrCheck", true);
				this.focusOnPackage(20);
				this.checkedMatnr = vMatnr;
			} else {
				this.playTerminalAudio(this.GL_ERROR);
				this.showMessageDialog(this.getResourceBundle().getText("matMessage"), "Material Does not exist.", sap.ui.core.ValueState.Error,"X");
				wholeSalesModel.setProperty("/MatnrCheck", false);
				wholeSalesModel.setProperty("/Matnr", "");
				wholeSalesModel.setProperty("/Exidv", "");
				this.checkedMatnr = "";
				//this.focusOnMatnrInput(400);
			}
		},

		checkMatnr: function(vMatnr) {
			var that = this;
			var oView = this.getView();
			var oModel = this.getView().getModel();
			var wholeSalesModel = that.getView().getModel("wholeSalesModel");
			var data = {
				MaterialNo: vMatnr
			};
			oView.setBusy(true);
			oModel.callFunction("/CheckMaterial", {
				method: "GET",
				urlParameters: data,
				success: function(oData) {
					oView.setBusy(false);
					if (oData.results[0].Type !== 'E') {
						// succesfully checked
						that.playTerminalAudio(that.GL_SUCCESS);
						wholeSalesModel.setProperty("/MatnrCheck", true);
						that.focusOnPackage(500);
						that.checkedMatnr = vMatnr;

					} else {
						// no material number
						that.playTerminalAudio(that.GL_ERROR);
						that.showMessageDialog(that.getResourceBundle().getText("matMessage"), oData.results[0].Message, sap.ui.core.ValueState.Error);
						wholeSalesModel.setProperty("/MatnrCheck", false);
						wholeSalesModel.setProperty("/Matnr", "");
						wholeSalesModel.setProperty("/Exidv", "");
					}

				},
				error: function(oError) {
					// metadata error
					oView.setBusy(false);
					that.checkedMatnr = "";
				}

			});
		},
		onReadPackageNo: function(oEvent) {
			this.stopAudioMessages();
			this.onRead(oEvent.getSource().getValue());
			
			
			//En Son Toplu Post Atılması için burası değiştirildi
			//
			//this.onReadLocall(oEvent.getSource().getValue());
		},
		doesPackageExist: function(exidv) {
			var wholeSalesModel = this.getView().getModel("wholeSalesModel");
			var TruckNo = wholeSalesModel.getProperty("/TruckNo");
			var WaveNo = wholeSalesModel.getProperty("/WaveNo");
			var Matnr = wholeSalesModel.getProperty("/Matnr");
			var wholeSalesObject = wholeSalesModel.getData();
			var pickingItemsArr = wholeSalesObject.ToPickingItems.results;
			for (var i = 0; i < pickingItemsArr.length; i++) {
				var item = pickingItemsArr[i];
				if (item.Exidv === exidv && item.TruckNo === TruckNo && item.WaveNo === WaveNo && item.Matnr === Matnr ) {
					return i;
				}
			}
			return -1;
		},
		onReadLocall: function(exidv) {
			var wholeSalesModel = this.getView().getModel("wholeSalesModel");
			var wholeSalesObject = wholeSalesModel.getData();
			var pickingItemsArr = wholeSalesObject.ToPickingItems.results;
			var indexPac =  this.doesPackageExist(exidv);
			if (this.doesPackageExist(exidv)){
				this.triggerFinish();
			}else{
				//
			}
			//

		},
		triggerFinish : function(){
			
		},
		onRead: function(exidv) {
			var that = this;
			var oView = this.getView();
			var oModel = oView.getModel();
			var wholeSalesModel = oView.getModel("wholeSalesModel");

			//
			var data = {
				Exidv: exidv,
				TruckNo: wholeSalesModel.getProperty("/TruckNo"),
				WaveNo: wholeSalesModel.getProperty("/WaveNo"),
				Matnr: wholeSalesModel.getProperty("/Matnr")
			};
			if (data.Exidv.length === 20 || data.Exidv.length === 15) {
				oView.setBusy(true);
				oModel.callFunction("/ReadPackageNo", {
					method: "POST",
					urlParameters: data,
					success: function(oData) {
						oView.setBusy(false);
						if (oData.ReturnType !== 'E') {
							that.playTerminalAudio(that.GL_SUCCESS);
							wholeSalesModel.setProperty("/Exidv", "");
							wholeSalesModel.setProperty("/Read", oData.Read);
							wholeSalesModel.setProperty("/MatnrCheck", false);
							wholeSalesModel.setProperty("/Matnr", "");
							wholeSalesModel.setProperty("/Exidv", "");
						/*	sap.m.MessageToast.show(oData.ReturnMessage, {
								duration: 200,
								onClose: function() {
									that.focusOnMatnrInput(500);
								}
							});*/
							that.focusOnMatnrInput(500);
							that.checkedMatnr = "";
							
						} else {
							that.playTerminalAudio(that.GL_ERROR);
							/*if (that.audio) {
								that.audio.play();
							}*/
							/*that.showMessageDialog(that.getResourceBundle().getText("huMessage"), oData.ReturnMessage, sap.ui.core.ValueState.Warning,
								'X');*/
							that.showMessageDialog(that.getResourceBundle().getText("huMessage"), oData.ReturnMessage, sap.ui.core.ValueState.Warning,
								"X");

							//  sap.m.MessageToast.show(oData.ReturnMessage);
							wholeSalesModel.setProperty("/Exidv", "");

						}

					},
					error: function(oError) {
						oView.setBusy(false);
						that.playTerminalAudio(that.GL_ERROR);
						/*if (that.audio) {
							that.audio.play();
						}*/
						console.log(oError);
					}

				});

			} else if (data.Exidv.length != 20 && data.Exidv.length != 15 && data.Exidv.length < 21) {
				/*if (that.audio) {
					that.audio.play();
				}*/
				that.playTerminalAudio(that.GL_ERROR);
				
				that.showMessageDialog(that.getResourceBundle().getText("huMessage"), that.getResourceBundle().getText("wrongLabel"), sap.ui.core
					.ValueState
					.Warning, 'X');
				wholeSalesModel.setProperty("/Exidv", "");
				//that.focusOnBarcodeInput();
				that.focusOnMatnrInput(1000);
			}

		},
		onFinishWave: function(oEvent) {
			var that = this;
			var oModel = this.getView().getModel();
			var wholeSalesModel = that.getView().getModel("wholeSalesModel");

			var data = {
				TruckNo: wholeSalesModel.getProperty("/TruckNo"),
				WaveNo: wholeSalesModel.getProperty("/WaveNo")
			};
			this.getView().setBusy(true);
			oModel.callFunction("/FinishWave", {
				method: "POST",
				urlParameters: data,
				success: function(oData) {
					that.getView().setBusy(false);
					//if (oData.ReturnType != 'E') {
					sap.m.MessageToast.show(oData.ReturnMessage, {
						duration: 3000,
						onClose: function() {
							that.getRouter().navTo("newWholeSalesAudit");
						}
					});
					//} else {
					//                           sap.m.MessageToast.show(oData.ReturnMessage);
					//            }
				},
				error: function(oError) {
					console.log(oError);
				}

			});

		},
		focusOnBarcodeInput: function() {
			/*idInpSu*/
			var myinput = this.getView().byId("idInpPackage");
			setTimeout(function() {
				myinput.focus();
			}, 500);
		},
		focusOnMatnrInput: function(vInterval) {
			/*idInpSu*/
			var myinput = this.getView().byId("idInpMatnr");
			setTimeout(function() {
				myinput.focus();
			}, vInterval);
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
			this.RenderStat = true;
			this.setAudioParameters();
		},
		onBack: function() {
			this.getRouter().navTo("outputMain");
		}
	});

});