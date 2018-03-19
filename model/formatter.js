sap.ui.define([], function() {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		setMessageType: function(sType) {
			if (sType == 'E') {
				return "Error";
			} else if (sType == 'S') {
				return "Success";
			}
		},
		setEinme: function(sEinme, sActual) {
			if (sActual) {
				return sActual;
			} else {
				if (sEinme) {
					if (sEinme.indexOf(".") > -1) {
						return sEinme.split(".")[0];
					}
					return sEinme;
				}
			}

		},
		dateFormatter: function(oDate) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd.MM.YYYY"
			});
			var dateFormatted = dateFormat.format(oDate);
			return dateFormatted;
		},
		backVisibility: function(iSeq) {
			//
			if (iSeq === 1) {
				return false;
			}
		},
		forvardVisibility: function(iSeq) {
			var dialog_length = this.modelLength;
			if (iSeq === dialog_length) {
				return false;
			}
			return true;
		},
		islenumVisible: function(sLenum) {
			if (sLenum) {
				return true;
			}
			return false;

		},
		quantityFormatter: function(Quant) {
			if ($.isNumeric(Quant)) {
				return parseInt(Quant);
			}
		},
		chechInventoryMaterialVisible: function(oParameter) {
			if (!oParameter) {
				return true;
			}
			return false;
		},
		chechkInventoryStorageVisible: function(oParameter) {
			if (oParameter) {
				return true;
			}
			return false;

		},
		chechkInventoryQuantityVisible:function(oValue){
//changed by mozkafa / 09.03.2018
//always Quantity fields are visible
//			return !oValue;
//add by mozkafa / 09.03.2018
			return true;
		},
		listButtonEnable: function(oArr) {
			if (oArr) {
				if (oArr.length > 0) {
					return true;
				}
			}
			return false;
		},
		addButtonEnable: function(oValue) {
			if (oValue) {
				return true;
			}
			return false;
		},
		enableSetbyL: function(oValue) {
			if (!oValue) {
				return true;
			} else {
				return false;
			}
		},
		enableSetbyLenum : function(oValue){
			if (oValue) {
				return true;
			} else {
				return false;
			}
		},
		showStorageUnitInList: function(oValue) {
			if (oValue) {
				return true;
			}
			return false;
		},
		showTitleLenumQuant: function(oLenum, oQuant) {
			var titleStr = "";
			if (oLenum) {
				titleStr = "Lenum:" + oLenum;
			}

			if (oQuant) {
				if (titleStr) {
					titleStr += " ";
				}
				titleStr += "Default Quantity :" + oQuant;
			}
			return titleStr;
		},
		isLenumEnabledByLgBer : function(vLgber){
			if(vLgber){
				return true;
			}
			return false;
		},
		isAddTransferReady : function(vMatnr){
			if(vMatnr){
				return true;
			}
			return false;
		},
		isTransferEnabled : function(sLgplaValid,sLgplad){
			if(sLgplaValid && sLgplad ){
				if(sLgplaValid === sLgplad){
					return true;
				}
				return false;
			}
			return false;
		}

	};

});