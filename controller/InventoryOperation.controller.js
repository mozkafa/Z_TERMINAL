sap.ui.define([
	"com/btc/terminal/controller/BaseController",
	"com/btc/terminal/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/m/Dialog"
], function(BaseController, formatter, JSONModel, MessageToast, Filter, Dialog) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.InventoryOperation", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.btc.terminal.view.InventoryOperation
		 */
		formatter: formatter,
		onInit: function() {
			this.limitValue = 0.1;
			var materials = new JSONModel({
				mItems: []
			});
			this.setModel(materials, "MateriaList");

			var sapLenum = new JSONModel({
				sapLenumList: []
			});
			this.setModel(sapLenum, "sapLenum");

			this.getRouter().getRoute("inventoryOperation").attachPatternMatched(this._onRouteMatched, this);

		},
		_onRouteMatched: function(oEvent) {
			/*var parameters = oEvent.getParameter("arguments");*/

			var quantityInput = this.getView().byId("idInpQuantityInv");
			quantityInput.setEnabled(false);
			this.clearCountingItems();
			if (this.hasAddressSet()) {
				if (this.isMaterialBasedOperation()) {
					this.focusOnInputWithIdAndInterval("idInpMaterialInv", 300); //idInpMaterialInv idInventoryInput
				} else {
					this.focusOnInputWithIdAndInterval("idInpStorageInv", 300); //idInpStorageInv
					this.getSapLenum();
				}
			} else {
				this.getRouter().navTo("inventorySelect");
			}

		},
		hasAddressSet: function() {
			var modelAddress = this.getModel("inventoryModel").getProperty("/Lgpla");
			if (modelAddress) {
				return true;
			}
			return false;
		},
		clearCountingItems: function() {
			var materialListModel = this.getView().getModel("MateriaList");
			var mListArray = [];
			materialListModel.setProperty("/mItems", mListArray);

		},
		isMaterialBasedOperation: function() {
			var selectedInventory = this.getModel("inventoryModel");
			var operationInput = selectedInventory.getProperty("/Lenvw");
			if (!operationInput) {
				return true;
			} else {
				return false;
			}
		},
		getSapLenum: function() {
			//
			var oView = this.getView();
			var oModel = oView.getModel();
			var selectedInventory = this.getModel("inventoryModel");
			var vLgpla = selectedInventory.getProperty("/Lgpla");
			var sapLenumListModel = this.getView().getModel("sapLenum");
			var sapLenumListArr = sapLenumListModel.getProperty("/sapLenumList");
			var filterArr = [];
			filterArr.push(new Filter("Lgpla", sap.ui.model.FilterOperator.EQ, vLgpla));
			oView.setBusy(true);
			oModel.read("/SapLenumSet", {
				filters: filterArr,
				success: function(oData) {
					oView.setBusy(false);
					if (oData.results) {
						if (oData.results.length > 0) {
							sapLenumListModel.setProperty("/sapLenumList", oData.results);
						}
					}

				},
				error: function(oError) {
					oView.setBusy(false);
				}
			});

		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.btc.terminal.view.InventoryOperation
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.btc.terminal.view.InventoryOperation
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.btc.terminal.view.InventoryOperation
		 */
		//	onExit: function() {
		//
		//	}
		deleteIconPressed: function(oEvent) {
			var listItem = oEvent.getSource().getParent();
			var dPath = listItem.getBindingContext("MateriaList").getPath();
			var idx = parseInt(dPath.substring(dPath.lastIndexOf('/') + 1));
			var jsonModel = this.getView().getModel("MateriaList");
			var d = jsonModel.getProperty("/mItems");

			d.splice(idx, 1);
			for (var i = 0; i < d.length; i++) {
				d[i].RowNo = (i + 1).toString();
			}
			jsonModel.setProperty("/mItems", d);
			jsonModel.updateBindings(true);

		},
		onListPressed: function(oEvent) {
			//dialog open
			var materialModel = this.getView().getModel("MateriaList");
			var pageInvModel = this.getView().getModel("inventoryModel");
			var Items = materialModel.getProperty("/mItems");
			pageInvModel.setProperty("/Ratio", Items[0].Ratio);
			if (!this.inventoryMaterialListDialog) {
				this.inventoryMaterialListDialog = new sap.ui.xmlfragment("com.btc.terminal.fragment.InventoryMaterialList", this);
				this.inventoryMaterialListDialog.setModel(materialModel, "MateriaList");
				this.inventoryMaterialListDialog.setModel(pageInvModel, "MainModel");
				//this.inventoryMaterialListDialog.setModel(anyModel);
				this.inventoryMaterialListDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				/*this.inventoryMaterialListDialog.addStyleClass("sapUiSizeCompact");*/ //Desktop Classs

			}
			this.inventoryMaterialListDialog.open();
		},
		focusOnInputWithIdAndInterval: function(iId, iValue) {
			/*idInpSu*/
			var firstInput = this.getView().byId(iId);
			var _this = this;
			setTimeout(function() {
				//myinput.focus();
				setTimeout(function() {
					firstInput.focus();
				}, iValue);
			}, iValue);
		},
		clearInputs: function() {
			var pageInvModel = this.getView().getModel("inventoryModel");
			var quantityInput = this.getView().byId("idInpQuantityInv");
			var isMatBased = this.isMaterialBasedOperation();
			pageInvModel.setProperty("/Maktx", "");
			pageInvModel.setProperty("/Meins", "");
			pageInvModel.setProperty("/Quantity", "");
			pageInvModel.setProperty("/Lgort", "");
			pageInvModel.setProperty("/Lenum", "");
			pageInvModel.setProperty("/Verme", "");
			pageInvModel.setProperty("/Letyp", "");
			pageInvModel.setProperty("/Werks", "");
			pageInvModel.setProperty("/IsFoundLqua", "");
			pageInvModel.setProperty("/SapLgpla", "");
			/*pageInvModel.setProperty("/Material","");
			pageInvModel.setProperty("/StorageUnit","");*/
			if (!isMatBased) {
				pageInvModel.setProperty("/Matnr", "");
			}
			quantityInput.setEnabled(false);
		},

		onSearch: function(oEvent) {

			var _this = this;
			var oModel = this.getView().getModel();
			var pageInvModel = this.getView().getModel("inventoryModel");
			var matnr = pageInvModel.getProperty("/Matnr");
			var storageU = pageInvModel.getProperty("/StorageUnit");
			var lgtyp = pageInvModel.getProperty("/Lgtyp");
			var lgpla = pageInvModel.getProperty("/Lgpla");
			var lgnum = pageInvModel.getProperty("/Lgnum");
			var oView = this.getView();
			var quantityInput = this.getView().byId("idInpQuantityInv");

			var urlParameterObjects = {};

			if (oEvent.getParameter("clearButtonPressed")) {
				//
				this.clearInputs();
				return;
			}

			var isMatBased = this.isMaterialBasedOperation();
			if (isMatBased) {
				// Search Based On Material
				storageU = ""; //guarantee
				// matnr hasValid Value
				if (!this.matnrHasValidValue(matnr)) {
					//Material number is not valid
					//this.showMessageDialog("Error","Material Number is not valid!", "Error");
					//MessageToast.show("Material Number is not valid!");
					return;
				}

			} else {
				//
				matnr = ""; // guarantee
				if (!this.storageUnitHasValidValue(storageU)) {
					//
					//this.showMessageDialog("Error","Storage number is not valid!", "Error");
					MessageToast.show("Storage Unit number is not valid!");
					return;
				}
			}
			urlParameterObjects = {
				Matnr: matnr,
				Lgtyp: lgtyp,
				Lgpla: lgpla,
				Lgnum: lgnum,
				Lenum: storageU
			};

			oView.setBusy(true);
			oModel.callFunction("/MateriaByAddress", {
				urlParameters: urlParameterObjects,
				method: "GET",
				success: function(oData, response) {
					oView.setBusy(false);
					if (oData.Matnr) {
						_this.setMateriaByAddressDataToModel(oData);
//changed by mozkafa / 09.03.2018	if (isMatBased) {
							quantityInput.setEnabled(true);
							_this.focusOnInputWithIdAndInterval("idInpQuantityInv", 200);
//						}

					} else {
						_this.LastSuccesfullRead = null;
						_this.clearInputs();
						_this.showMessageDialog("Error", matnr + " Not Found!", "Error");
					}

				},
				error: function(oError) {
					var errorInJson = JSON.parse(oError.responseText);
					oView.setBusy(false);
					_this.LastSuccesfullRead = null;
					_this.clearInputs();
					_this.showMessageDialog("Error", errorInJson.error.message.value, "Error");
				}
			});

		},
		getSapLenumArray: function() {
			var sapLenumModel = this.getView().getModel("sapLenum");
			return sapLenumModel.getProperty("/sapLenumList");
		},
		confirmedEmptyStorageBin: function() {
			//
			var pageInvModel = this.getView().getModel("inventoryModel");
			var emptyLgpla = pageInvModel.getProperty("/Lgpla");
			var _this = this;
			var oModel = this.getView().getModel();
			var oView = this.getView();
			var oCore = sap.ui.getCore();
			if(emptyLgpla ){
								oCore.lock();
			oView.setBusy(true);
			oModel.callFunction("/EmptyStorageBin", {
				urlParameters: {
					Lgpla: emptyLgpla
				},
				method: "GET",
				success: function(oData) {
					oView.setBusy(false);
					oCore.unlock();
					if (oData.Type === "E") {
						_this.showMessageDialog("Error", oData.Message , "Error");
					} else {
						MessageToast.show("Successful Operation", {
							closeOnBrowserNavigation: false
						});
						_this.getRouter().navTo("inventorySelect");
					}
				},
				error: function(oError) {
					//var errorInJson = JSON.parse(oError.responseText);
					oView.setBusy(false);
					oCore.unlock();

				}
			});
			}else{
				//
			}
			


		},
		emptyStorageBinPress: function(oEvent) {
			var _this = this;
			var dialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new sap.m.Text({
					text: 'Are you sure to do that operation ?'
				}),
				beginButton: new sap.m.Button({
					text: 'Submit',
					press: function() {
						_this.confirmedEmptyStorageBin();
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		onApproveDialog: function() {
			var _this = this;
			var dialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new sap.m.Text({
					text: 'Are you sure ?'
				}),
				beginButton: new sap.m.Button({
					text: 'Submit',
					press: function() {
						_this.confirmedFinish();
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		confirmedFinish: function() {
			var pageInvModel = this.getView().getModel("inventoryModel");
			var materialListModel = this.getView().getModel("MateriaList");
			var mListArray = materialListModel.getProperty("/mItems");
			var oModel = this.getView().getModel();
			var _myView = this.getView();
			var oCore = sap.ui.getCore();
			var _this = this;
			//CountingSet
			var myRequest = {
				ItemCount: pageInvModel.getProperty("/ItemCount"),
				Lgpla: pageInvModel.getProperty("/Lgpla"),
				Lgnum: pageInvModel.getProperty("/Lgnum"),
				Lenvw: pageInvModel.getProperty("/Lenvw"),
				Lgtyp: pageInvModel.getProperty("/Lgtyp"),
				Lgber: pageInvModel.getProperty("/Lgber"),
				Screen: 0,
				Message: "DeepInsert",
				CountinItems: []
			};

			/*var arrItems = [];*/
			for (var i = 0; i < mListArray.length; i++) {

				var tempItem = {
					ItemNo: "",
					Username: "",
					Daterecorded: null,
					Matnr: mListArray[i].Matnr,
					Maktx: mListArray[i].Maktx,
					Timerecorded: null,
					Lgnum: mListArray[i].Lgnum,
					Werks: mListArray[i].Werks,
					Lgort: mListArray[i].Lgort,
					Lgtyp: mListArray[i].Lgtyp,
					SapLgtyp: mListArray[i].SapLgtyp,
					Lenvw: mListArray[i].Lenvw,
					Lgpla: mListArray[i].Lgpla,
					SapLgpla: mListArray[i].SapLgpla,
					Lgber: mListArray[i].Lgber,
					Lenum: mListArray[i].Lenum,
					Letyp: "", // IP icin Numeric İstiyor
					Meins: mListArray[i].Meins,
					VermeTotal: mListArray[i].VermeTotal,
					IsFoundLqua: mListArray[i].IsFoundLqua,
					SapQuant: mListArray[i].SapQuant.toString(),
					CountQuant: mListArray[i].CountQuant.toString(),
					DiffQuant: mListArray[i].DiffQuant.toString(),
					DiffAbsolute: mListArray[i].DiffAbsolute.toString(),
					Ratio: mListArray[i].Ratio.toString()
				};
				myRequest.CountinItems.push(tempItem);
			}

			_myView.setBusy(true);
			oCore.lock();
			oModel.create("/InventoryCheckSet", myRequest, {
				success: function(oData, results) {
					_myView.setBusy(false);
					oCore.unlock();

					/*_this.showMessageDialog("Successful Operation", " Counting Successful", "Success");*/
					MessageToast.show("Successful operation", {
						closeOnBrowserNavigation: false
					});
					/*	setTimeout(function(){
							 
							
						}, 3000);*/
					_this.getRouter().navTo("inventorySelect");

				},
				error: function(err) {
					_myView.setBusy(false);
					oCore.unlock();
					if (err) {
						var oErrorResponse = JSON.parse(err.responseText);
						var oErrorDetailsArr = oErrorResponse.error.innererror.errordetails;
						if (oErrorDetailsArr) {
							if (oErrorDetailsArr.length) {
								if (oErrorDetailsArr.length > 0) {
									var ErrorDeatail = oErrorDetailsArr[0];
									if (ErrorDeatail.code === "9/111") {
										_this.showMessageDialog("Error", ErrorDeatail.message, "Error");
									}
								}
							}
						}

					} else {
						_this.showMessageDialog("Error", " Error while Counting operation!", "Error");
					}

				}
			});
		},
		onFinishPress: function() { // wihout batch

			var materialListModel = this.getView().getModel("MateriaList");
			var mListArray = materialListModel.getProperty("/mItems");
			var ratio = parseFloat(mListArray[0].Ratio);
			if (ratio > 0.1) {
				//
				this.onApproveDialog();
			} else {
				this.confirmedFinish();
			}

		},
		setMateriaByAddressDataToModel: function(oData) {
			//
			var pageInvModel = this.getView().getModel("inventoryModel");
			if (this.isMaterialBasedOperation()) {
				pageInvModel.setProperty("/Matnr", oData.Matnr);
				pageInvModel.setProperty("/Maktx", oData.Maktx);
				pageInvModel.setProperty("/Meins", oData.Meins);
				pageInvModel.setProperty("/Lgort", oData.Lgort);
				pageInvModel.setProperty("/Lenum", oData.Lenum);
				pageInvModel.setProperty("/Verme", oData.Verme);
				pageInvModel.setProperty("/Letyp", oData.Letyp);
				pageInvModel.setProperty("/Werks", oData.Werks);
				pageInvModel.setProperty("/IsFoundLqua", oData.IsFoundLqua);
				pageInvModel.setProperty("/SapLgpla", oData.Lgpla);
			} else {
				//Lenum Based Operation
				if (oData.IsFoundLqua === false) {
					// Lquada bulunamayan 
					pageInvModel.setProperty("/SapLgtyp", "");
					//Letype ve Lenumu boş Lgtypsife boş
				} else {
					//
					pageInvModel.setProperty("/SapLgtyp", oData.Lgtyp);
				}
				pageInvModel.setProperty("/Matnr", oData.Matnr);
				pageInvModel.setProperty("/Maktx", oData.Maktx);
				pageInvModel.setProperty("/Meins", oData.Meins);
				pageInvModel.setProperty("/Lgort", oData.Lgort);
				pageInvModel.setProperty("/Lenum", oData.Lenum);
				pageInvModel.setProperty("/Verme", oData.Verme);
				pageInvModel.setProperty("/Letyp", oData.Letyp);
				pageInvModel.setProperty("/Werks", oData.Werks);
				pageInvModel.setProperty("/IsFoundLqua", oData.IsFoundLqua);
				pageInvModel.setProperty("/SapLgpla", oData.Lgpla);

			}

			/*	this.LastSuccesfullRead = {   //Cekilen bilgiler anlık olarak değişebilir .
					Matnr: oData.Matnr,
					Maktx: oData.Maktx,
					Meins: oData.Meins,
					Lgort: oData.Lgort,
					Lenum: oData.Lenum,
					Verme: oData.Verme,
					Letyp: oData.Letyp,
					Werks: oData.Werks,
					IsFoundLqua: oData.IsFoundLqua
				};*/
		},
		matnrHasValidValue: function(oMatnr) {
			if (oMatnr && $.isNumeric(oMatnr)) {
				return true;
			}
			return false;
		},
		storageUnitHasValidValue: function(oStorageUnit) {
			if (oStorageUnit) {
				return true;
			}
			return false;
		},
		onMaterialChange: function(oEvent) {
			var newMatValue = oEvent.getParameter("newValue");
			var pageInvModel = this.getView().getModel("inventoryModel");
			if (newMatValue) {
				if (pageInvModel.getProperty("/Maktx")) {
					this.clearInputs();
				}
				/*if (this.LastSuccesfullRead) {
					if (this.LastSuccesfullRead.Matnr === newMatValue) {
						var quantityInput = this.getView().byId("idInpQuantityInv");
						quantityInput.setEnabled(true);
						pageInvModel.setProperty("/Matnr", this.LastSuccesfullRead.Matnr);
						pageInvModel.setProperty("/Maktx", this.LastSuccesfullRead.Maktx);
						pageInvModel.setProperty("/Meins", this.LastSuccesfullRead.Meins);
						pageInvModel.setProperty("/Lgort", this.LastSuccesfullRead.Lgort);
						pageInvModel.setProperty("/Lenum", this.LastSuccesfullRead.Lenum);
						pageInvModel.setProperty("/Verme", this.LastSuccesfullRead.Verme);
						pageInvModel.setProperty("/Letyp", this.LastSuccesfullRead.Letyp);
						pageInvModel.setProperty("/Werks", this.LastSuccesfullRead.Werks);

					} else {
						this.clearInputs();
					}
				}*/
			} else {
				if (pageInvModel.getProperty("/Maktx")) {
					this.clearInputs();
				}
				/*this.clearInputs();*/
			}
		},
		onStorageChange: function(oEvent) {
			var newStorageValue = oEvent.getParameter("newValue");
			if (newStorageValue) {
				//
			}
		},
		lenumExistOnSapDelivered: function(vLenum) {
			var sapRetrievedLenumArr = this.getSapLenumArray();
			var exist = false;
			for (var i = 0; i < sapRetrievedLenumArr.length; i++) {
				if (sapRetrievedLenumArr[i].Lenum === vLenum) {
					exist = true;
					break;
				}
			}
			return exist;
		},

		closeMaterialListDialog: function(oEvent) {
			var oView = this.getView();
			var ismaterialBased = this.isMaterialBasedOperation();
			if (ismaterialBased) {
				var inValidMaterial = this.materialQuantitesValid();
				if (inValidMaterial !== null) {
					//
					this.showMessageDialog("Quantity Error", "Enter Quantity for Material : " + inValidMaterial + " or delete it !", "Error");
					return;
				}
			}
			this.inventoryMaterialListDialog.close();
			this.inventoryMaterialListDialog.destroy(true);
			this.inventoryMaterialListDialog = null;

			if (ismaterialBased) {
				this.focusOnInputWithIdAndInterval("idInpMaterialInv", 300); //idInpMaterialInv idInventoryInput
			} else {
				this.focusOnInputWithIdAndInterval("idInpStorageInv", 300); //idInpStorageInv

			}

		},
		materialQuantitesValid: function() {
			var material = null;
			var materialListModel = this.getView().getModel("MateriaList");
			var mListArray = materialListModel.getProperty("/mItems");
			for (var i = 0; i < mListArray.length; i++) {
				if (!mListArray[i].CountQuant) {
					//
					material = mListArray[i].Matnr;
					return material;

				}

			}
			return material;
		},
		matExistInTheList: function(vMatnr, vLgpla) {
			var materialListModel = this.getView().getModel("MateriaList");
			var mListArray = materialListModel.getProperty("/mItems");
			var exist = false;
			for (var i = 0; i < mListArray.length; i++) {
				if (mListArray[i].Matnr === vMatnr && mListArray[i].SapLgpla === vLgpla) {
					//
					exist = true;
					return exist;
				}

			}
			return exist;
		},
		lenumExistIntheList: function(vLenum, vLgpla) {
			var materialListModel = this.getView().getModel("MateriaList");
			var mListArray = materialListModel.getProperty("/mItems");
			var exist = false;
			for (var i = 0; i < mListArray.length; i++) {
				if (mListArray[i].Lenum === vLenum && mListArray[i].SapLgpla === vLgpla) {
					//
					exist = true;
					return exist;
				}
			}
			return exist;
		},
		getBeforeQuantities: function(iVal) {
			//parseFloat
			var totalRet = 0.0;
			var materialListModel = this.getView().getModel("MateriaList");
			var mListArray = materialListModel.getProperty("/mItems");
			for (var i = 0; i < mListArray.length; i++) {

				if (iVal && iVal !== i) {
					totalRet += mListArray[i].CountQuant;
				}
			}
			return totalRet;

		},
		updateItemsRatio: function(ratio) {
			var materialListModel = this.getView().getModel("MateriaList");
			var pageInvModel = this.getView().getModel("inventoryModel");
			var mListArray = materialListModel.getProperty("/mItems");
			for (var i = 0; i < mListArray.length; i++) {
				mListArray[i].Ratio = ratio;

			}
			pageInvModel.setProperty("/Ratio", ratio);
			materialListModel.updateBindings(true);
		},
		onQuantityListChange: function(oEvent) {

		},
		onQuantityListLiveChange: function(oEvent) {
			var myInput = oEvent.getSource();
			var vString = oEvent.getParameter("value");
			var listItem = oEvent.getSource().getParent();
			var dPath = listItem.getBindingContext("MateriaList").getPath();
			var idx = parseInt(dPath.substring(dPath.lastIndexOf('/') + 1));
			var jsonModel = this.getView().getModel("MateriaList");
			var d = jsonModel.getProperty("/mItems");
			var changingItem = d[idx];
			var ratioBeforeChange = changingItem.Ratio;
			var quantBeforeChange = changingItem.CountQuant;
			if (!vString) {
				myInput.setValueState(sap.ui.core.ValueState.Error);
				/*d[idx].CountQuant = quantBeforeChange;*/
			} else {
				var newCalculations = this.getChangingItem(changingItem, vString, idx);
				d[idx].Ratio = newCalculations.Ratio;
				d[idx].DiffAbsolute = newCalculations.DiffAbsolute;
				d[idx].CountQuant = newCalculations.CountQuant;
				d[idx].DiffQuant = newCalculations.DiffQuant;
				jsonModel.setProperty("/mItems", d);
				jsonModel.updateBindings(true);
				this.updateItemsRatio(newCalculations.Ratio);
				myInput.setValueState(sap.ui.core.ValueState.None);
			}

			/*jsonModel.updateBindings(true);*/

		},
		getChangingItem: function(vChangingItem, vString, idx) {
			var befQuant = this.getBeforeQuantities(idx);
			var quantityNum = parseFloat(vString);
			var totalquantity = quantityNum + befQuant;

			var vermeRetrieved = parseFloat(vChangingItem.SapQuant);
			var vermeDiff = vermeRetrieved - totalquantity;
			var vermeAbsDiff = Math.abs(vermeDiff);
			if (vermeRetrieved === 0) {
				var ratio = 1;
			} else {
				var ratio = (vermeAbsDiff / vermeRetrieved).toFixed(3);
			}

			return {
				Ratio: ratio,
				DiffAbsolute: vermeAbsDiff,
				CountQuant: quantityNum,
				DiffQuant: vermeDiff
			};

		},
		setVisibleRatioToOne: function() {

		},
		onAddPress: function(oEvent) {
			var pageInvModel = this.getView().getModel("inventoryModel");
			var itemQuantity = pageInvModel.getProperty("/Quantity");

			var materialListModel = this.getView().getModel("MateriaList");
			var mListArray = materialListModel.getProperty("/mItems");
			var uploadItem;

			var isMaterialBasedOperation = this.isMaterialBasedOperation(); //pageInvModel.getProperty("/Lenvw");

			if (isMaterialBasedOperation) {
				//Operation Bsed on Storage Unit Lenum Based
				//checkMaterial and Lgpla exist before
				var matWithLgplaExist = this.matExistInTheList(pageInvModel.getProperty("/Matnr"), pageInvModel.getProperty("/Lgpla"));
				if (matWithLgplaExist) {
					this.showMessageDialog("Duplicate Item", "Material with Address already added!", "Error");
					this.clearInputs();
					return;
				}
				if (!itemQuantity) {
					this.showMessageDialog("Quantity Empty", "Please Add Quantity!", "Error");
					this.clearInputs();
					return;
				}
				var isFoundInLqua = pageInvModel.getProperty("/IsFoundLqua");
				var beforeQuantities = this.getBeforeQuantities(-1);
				var quantityNum = parseFloat(pageInvModel.getProperty("/Quantity"));

				var vermeRetrieved = parseFloat(pageInvModel.getProperty("/Verme"));
				var vermeToatalFloat = parseFloat(pageInvModel.getProperty("/VermeTotal"));
				//var vermeDiff = vermeRetrieved - quantityNum;
				var vermeItemDiff = vermeRetrieved - quantityNum;
				var vermeDiff = vermeToatalFloat - (quantityNum + beforeQuantities);

				var vermeAbsDiff = Math.abs(vermeDiff);
				if (vermeRetrieved === 0) {
					var ratio = 1;
					this.setVisibleRatioToOne();
				} else {
					//var ratio = (vermeAbsDiff / vermeRetrieved).toFixed(3);
					if (vermeToatalFloat === 0) {
						var ratio = 1;
					} else {
						var ratio = (vermeAbsDiff / vermeToatalFloat).toFixed(3);
					}

				}

				this.updateItemsRatio(ratio);

				uploadItem = {
					Matnr: pageInvModel.getProperty("/Matnr"),
					Maktx: pageInvModel.getProperty("/Maktx"),
					Lgnum: pageInvModel.getProperty("/Lgnum"),
					Werks: pageInvModel.getProperty("/Werks"),
					Lgort: pageInvModel.getProperty("/Lgort"),
					Lgtyp: pageInvModel.getProperty("/Lgtyp"),
					Lenvw: pageInvModel.getProperty("/Lenvw"),
					Lgpla: pageInvModel.getProperty("/Lgpla"),
					Lenum: pageInvModel.getProperty("/Lenum"),
					Lgber: pageInvModel.getProperty("/Lgber"),
					Meins: pageInvModel.getProperty("/Meins"),
					IsFoundLqua : pageInvModel.getProperty("/IsFoundLqua"),
					Letyp: pageInvModel.getProperty("/Letyp"),
					SapLgpla: pageInvModel.getProperty("/SapLgpla"),
					VermeTotal: pageInvModel.getProperty("/VermeTotal"),
					SapQuant: vermeRetrieved,
					CountQuant: quantityNum,
					DiffQuant: vermeItemDiff,
					DiffAbsolute: Math.abs(vermeItemDiff),
					Ratio: ratio

				};
				mListArray.push(uploadItem);
				MessageToast.show("Item with Quantity " + quantityNum + " added.");
				this.clearInputs();
				pageInvModel.setProperty("/Matnr", "");
				this.focusOnInputWithIdAndInterval("idInpMaterialInv", 300);
				materialListModel.updateBindings(true);

			} else {
				//lenumExistIntheList : function(vLenum, vLgpla)

				var inpLenum = pageInvModel.getProperty("/Lenum");
				var lenumWithLgplaExist = this.lenumExistIntheList(inpLenum, pageInvModel.getProperty("/SapLgpla"));
				if (lenumWithLgplaExist) {
					this.showMessageDialog("Duplicate Item", "Storage Unit with same Address already added!", "Error");
					return;
				}
				var vermeRetrieved = 0;
				//Operation Based Storage Number
				if (pageInvModel.getProperty("/Verme")) {
					vermeRetrieved = parseFloat(pageInvModel.getProperty("/Verme"));
				}

				var lenumExist = this.lenumExistOnSapDelivered(inpLenum);

				uploadItem = {
					Matnr: pageInvModel.getProperty("/Matnr"),
					Maktx: pageInvModel.getProperty("/Maktx"),
					Lgnum: pageInvModel.getProperty("/Lgnum"),
					Werks: pageInvModel.getProperty("/Werks"),
					Lgort: pageInvModel.getProperty("/Lgort"),
					Lgtyp: pageInvModel.getProperty("/Lgtyp"),
					Lenvw: pageInvModel.getProperty("/Lenvw"),
					Lgpla: pageInvModel.getProperty("/Lgpla"),
					Lenum: pageInvModel.getProperty("/Lenum"),
					Lgber: pageInvModel.getProperty("/Lgber"),
					Meins: pageInvModel.getProperty("/Meins"),
					Letyp: pageInvModel.getProperty("/Letyp"),
					SapLgpla: pageInvModel.getProperty("/SapLgpla"),
					SapLgtyp: pageInvModel.getProperty("/SapLgtyp"),
					VermeTotal: pageInvModel.getProperty("/VermeTotal"),
					IsFoundLqua: pageInvModel.getProperty("/IsFoundLqua"),
					SapQuant: vermeRetrieved,
//changed by mozkafa / 09.03.2018	CountQuant: 0,
					CountQuant: itemQuantity,
					DiffQuant: 0,
					DiffAbsolute: 0,
					Ratio: 0

				};
				mListArray.push(uploadItem);
				MessageToast.show("Item with Storage Unit Number :  " + inpLenum + " added.");
				this.clearInputs();
				pageInvModel.setProperty("/Matnr", "");
				pageInvModel.setProperty("/Lenum", "");
				pageInvModel.setProperty("/StorageUnit", "");
				this.focusOnInputWithIdAndInterval("idInpStorageInv", 100);
				materialListModel.updateBindings(true);

			}

		}

	});

});