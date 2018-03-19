sap.ui.define([
	"com/btc/terminal/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"com/btc/terminal/model/formatter"
], function(BaseController, JSONModel, Filter,formatter) {
	"use strict";

	return BaseController.extend("com.btc.terminal.controller.StockOverview", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.btc.terminal.view.StockOverview
		 */
		 formatter : formatter,
		 
		onInit: function() {
			
			this.getRouter().getRoute("stockOverview").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function() {
			
			this.focusOnMaterial(500);
			var mStockOverView = new JSONModel();
			var oStockOverview = {
				matnr: "",
				plant: "",
				storageType: ""
			};
			mStockOverView.setData(oStockOverview);
			var oView = this.getView();
			// set the model to the core
			oView.setModel(mStockOverView, "stockOverview");
		},
		focusOnMaterial : function(iValue){
			/*idInpSu*/
			var firstInput = this.getView().byId("idInpStockMat");
			var _this = this;
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
		 * @memberOf com.btc.terminal.view.StockOverview
		 */
		onBeforeRendering: function() {

		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.btc.terminal.view.StockOverview
		 */
		onAfterRendering: function() {

		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.btc.terminal.view.StockOverview
		 */
		onExit: function() {

		},

		onStorageBinPressed: function(oEvent) {
			var oView = this.getView();
			var oModel = oView.getModel();
			var stockModel = oView.getModel("stockOverview");
			var vMatnr = stockModel.getProperty("/matnr"); // "I_MATNR" import parameter in function ZMB_GET_SORT_BY_LOC --->  "Matnr" as filter value -- can not be empty
			if (!vMatnr) {
				//matnr girilmedi
				this.showMessageDialog("Error", "Material number should be entered!", "Error");
			} else {
				//
				var _this = this;
				var filterArr = [];
				var vPlant = stockModel.getProperty("/plant");
				var vStorageType = stockModel.getProperty("/storageType");
				var vLgNum = "931"; // "I_LGNUM" import parameter in function ZMB_GET_SORT_BY_LOC ---> "Lgnum" as filter value -- value should be set to "931" 
				if (!vPlant) {
					//"I_WERKS" import parameter in function ZMB_GET_SORT_BY_LOC   ---> "Werks" as filter value -- if is empty set value to "1903"
					vPlant = "1903";
				}
				if (!vStorageType) {
					//"I_STORAGE_TYP" import parameter in function  ZMB_GET_SORT_BY_LOC   ---> "Lgtyp" as filter value -- if is empty set value to "%"
					vStorageType = "%";
				}
				filterArr.push(new Filter("Lgnum", sap.ui.model.FilterOperator.EQ, vLgNum));
				filterArr.push(new Filter("Werks", sap.ui.model.FilterOperator.EQ, vPlant));
				filterArr.push(new Filter("Lgtyp", sap.ui.model.FilterOperator.EQ, vStorageType));
				filterArr.push(new Filter("Matnr", sap.ui.model.FilterOperator.EQ, vMatnr));
				oView.setBusy(true);
				oModel.read("/StockOverviewSet", {
					filters: filterArr,
					success: function(oData) {
						oView.setBusy(false);
						var myReturnItems = oData.results;
						
						if (myReturnItems.length > 0) {
							_this.modelLength = myReturnItems.length;
							var mStockDetail = new JSONModel();
							mStockDetail.setData(oData.results);
							var mStockDetailItem = new JSONModel();
							mStockDetailItem.setData(oData.results[0]);
							if (!_this.stockOverviewDialog) {
								_this.stockOverviewDialog = new sap.ui.xmlfragment("com.btc.terminal.fragment.StockOverviewDetail", _this);
								_this.stockOverviewDialog.setModel(mStockDetailItem, "stockItem");
								_this.stockOverviewDialog.setModel(mStockDetail);
								_this.stockOverviewDialog.itemIndex = 0;
								
								_this.stockOverviewDialog.addStyleClass(_this.getOwnerComponent().getContentDensityClass());
							}
							_this.stockOverviewDialog.open();

						}
					},
					error: function(oError) {
						oView.setBusy(false);
						var myresPonseText = JSON.parse(oError.responseText).error.message.value;
						_this.showMessageDialog("Error", myresPonseText, "Error");
						
						
					}
				});

			}

		},
		closeDetailDialog: function(oEvent) {
			this.stockOverviewDialog.close();
			this.stockOverviewDialog=null;
			var oView = this.getView();
			// set the model to the core
			var pageModel = oView.getModel("stockOverview");
			pageModel.setProperty("/matnr","");
			pageModel.setProperty("/plant","");
			pageModel.setProperty("/storageType","");
			/*var firstInput = oView.byId("idInpStockMat");
			firstInput.focus();*/
			this.focusOnMaterial(200);
			
		},
		backPressed : function(oEvent){
			var itemIndex = this.stockOverviewDialog.itemIndex;
			var stocModel = this.stockOverviewDialog.getModel("stockItem");
			var stockItems = this.stockOverviewDialog.getModel().getData();
			
			if(itemIndex > 0 ){
				this.stockOverviewDialog.itemIndex--;
				stocModel.setData(stockItems[this.stockOverviewDialog.itemIndex]);
			}
		},
		forwardPresed : function(oEvent){
			var itemIndex = this.stockOverviewDialog.itemIndex;
			var stocModel = this.stockOverviewDialog.getModel("stockItem");
			var stockItems = this.stockOverviewDialog.getModel().getData();
			
			if(itemIndex+1 < stockItems.length ){
				this.stockOverviewDialog.itemIndex++;
				stocModel.setData(stockItems[this.stockOverviewDialog.itemIndex]);
			}
			
			
		//	this.stockOverviewDialog.setModel(mStockDetailItem, "stockItem");
			
		}

	});

});