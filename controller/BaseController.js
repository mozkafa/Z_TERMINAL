sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"com/btc/terminal/JS/howler"
], function(Controller, History, howler) {
	"use strict";

	return Controller.extend("com.btc.terminal.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		audioSuccess: null,
		audioError: null,
		GL_ERROR: "ERROR",
		GL_SUCCESS: "SUCCESS",
		sServiceUrl: "/sap/opu/odata/sap/ZMB_WM_RF_PROCESS_SRV/",
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},
		setAudioParameters: function() {
			this.getErrorAudio();
			this.getSuccessAudio();
		},
		getErrorAudio: function() {
			var sUri = this.sServiceUrl + "TerminalAudioSet('" + this.GL_ERROR + "')/$value";
			var soundURL = encodeURI(sUri);
			var sound = new Howl({
				src: [soundURL],
				format: ['dolby', 'webm', 'mp3'],
				html5: true,
				xhrWithCredentials: true
			});
			this.audioError = sound;
			this.audioError.load();

		},
		getSuccessAudio: function() {
			var sUri = this.sServiceUrl + "TerminalAudioSet('" + this.GL_SUCCESS + "')/$value";
			var soundURL = encodeURI(sUri);
			var sound = new Howl({
				src: [soundURL],
				format: ['dolby', 'webm', 'mp3'],
				html5: true,
				xhrWithCredentials: true
			});
			this.audioSuccess = sound;
			this.audioSuccess.load();

		},
		/*	playAudioWithParameter: function(sErrorType) {
				var sUri = this.sServiceUrl + "TerminalAudioSet('" + sErrorType + "')/$value";
				var soundURL = encodeURI(sUri);
				var oAudio = new Audio(soundURL);
				if (sErrorType === this.GL_SUCCESS) {
					this.audioSuccess = oAudio;
				} else {
					this.audioError = oAudio;
				}
				oAudio.addEventListener("ended", function() {
					oAudio.pause();
					//oAudio.currentTime = 0;
				});
				oAudio.load();
				oAudio.play();

			},*/
		playTerminalAudio: function(sErrorType) {
			/*if (sErrorType === this.GL_SUCCESS) {
				if (this.audioSuccess !== null) {
				
					this.audioSuccess.load();
					this.audioSuccess.play();
				} else {
					// 
					this.playAudioWithParameter(this.GL_SUCCESS);
				}
			} else {
				//GL_ERROR
				if (this.audioError !== null) {
					this.audioError.load();	
					this.audioError.play();
				} else {
					//
					this.playAudioWithParameter(this.GL_ERROR);
				}
			}*/

			if (sErrorType === this.GL_SUCCESS) {
				if (this.audioSuccess !== null) {
					this.audioSuccess.play();
				} else {
					// 
					var sUri = this.sServiceUrl + "TerminalAudioSet('" + this.GL_SUCCESS + "')/$value";
					var soundURL = encodeURI(sUri);
					var sound = new Howl({
						src: [soundURL],
						format: ['dolby', 'webm', 'mp3'],
						html5: true,
						xhrWithCredentials: true
					});
					this.audioSuccess = sound;
					this.audioSuccess.play();
				}
			} else {
				//GL_ERROR
				if (this.audioError !== null) {
					this.audioError.play();
				} else {
					//
					var sUri = this.sServiceUrl + "TerminalAudioSet('" + this.GL_ERROR + "')/$value";
					var soundURL = encodeURI(sUri);
					var sound = new Howl({
						src: [soundURL],
						format: ['dolby', 'webm', 'mp3'],
						html5: true,
						xhrWithCredentials: true
					});
					this.audioError = sound;
					this.audioError.play();

				}
			}

		},
		stopAudioMessages: function() {
			if (this.audioError) {
				this.audioError.stop();
			}
			if (this.audioSuccess) {
				this.audioSuccess.stop();
			}
		},
		getTransferModel: function() {
			var transferModel = this.getModel("TransferAddressModel");
			return transferModel;
		},
		clearTransferModel: function() {
			var transferModel = this.getTransferModel();
			transferModel.setData({});
		},
		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},
		navToMain: function() {
			this.getRouter().navTo("main", {}, true);
		},
		/*		showMessageDialog: function(sTitle, sText, state) {
					var dialog = new sap.m.Dialog({
						title: sTitle,
						type: "Message",
						state: state,
						content: new sap.m.Text({
							text: sText
						}),
						beginButton: new sap.m.Button({
							text: this.getResourceBundle().getText("Okay"),
							press: function() {
								dialog.close();
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}
					});

					dialog.open();
				},*/
		showMessageDialog: function(sTitle, sText, state, focus) {
			var that = this;
			var oView = this.getView();
			var wholeSalesModel = oView.getModel("wholeSalesModel");
			var dialog = new sap.m.Dialog({
				title: sTitle,
				type: "Message",
				state: state,
				content: new sap.m.Text({
					text: sText
				}),
				beginButton: new sap.m.Button({
					text: this.getResourceBundle().getText("Okay"),
					press: function() {
						dialog.close();
						if (focus === 'X') {
							//Package Material is not right
							if (sText === "Package Material is not right") {
								wholeSalesModel.setProperty("/Matnr", "");
								wholeSalesModel.setProperty("/MatnrCheck", false);
								that.focusOnMatnrInput(500);
							} else if (sText === "Material Does not exist.") {
								wholeSalesModel.setProperty("/Matnr", "");
								wholeSalesModel.setProperty("/MatnrCheck", false);
								that.focusOnMatnrInput(800);
							} else {
								that.focusOnBarcodeInput();
							}

						}
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		onNavBack: function(oEvent) {
			var wholeSalesModel = this.getView().getModel("wholeSalesModel");
			wholeSalesModel.setProperty("/Barcode", "");

			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {

				history.go(-1);

			} else {
				this.getRouter().navTo("main", {}, true);

			}
		},
		setReadonylTrueForInput: function(control) {
			if (control) {
				var sapInput = control;
				var inputTypeName = sapInput.getMetadata().getName();
				if (inputTypeName === "sap.m.SearchField") { // searchField için input alanı farklı
					$(sapInput._inputElement).attr('readonly', true);
				} else if (inputTypeName === "sap.m.Input") {
					//
				}

			}
		},
		isPhoneOrTablet: function() {
			if (this.getModel("device").getData().system.phone || this.getModel("device").getData().system.tablet) {
				return true;
			}
			return false;
		},

		onBarcodeCheck: function(barcode) {
			var that = this;
			var oModel = this.getView().getModel();
			var wholeSalesModel = this.getView().getModel("wholeSalesModel");
			var value = wholeSalesModel.getProperty("/Barcode");
			if (value == "") {
				value = barcode;
			}
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			if (value.length > 8) {
				this.getView().setBusy(true);
				oModel.read("/PickingSet('" + value + "')", { //?$expand=ToPickingItems
					urlParameters: {
						"$expand": "ToPickingItems",
						"length": "1000"
					},
					success: function(oData) {
						that.getView().setBusy(false);
						if (oData.ReturnType != 'E') {
							that.playTerminalAudio(that.GL_SUCCESS);
							oData.Matnr = ""; // material number entered
							oData.MatnrCheck = false; // material check 
							wholeSalesModel.setData(oData);

							that.getRouter().navTo("wholeSalesAuditDetail", {
								Barcode: value
							});
						} else {
							that.playTerminalAudio(that.GL_ERROR);
							wholeSalesModel.setProperty("/Barcode", "");
							sap.m.MessageToast.show(oData.ReturnMessage, {
								duration: 5000
							});
						}

					},
					error: function(oError) {
						that.getView().setBusy(false);
						that.playTerminalAudio(that.GL_ERROR);
						/*	if (that.audio) {
								that.audio.play();
							}*/
						console.log(oError);
					}
				});
			}

		},
		replaceLeadingZeros: function(oValue) {
			if (oValue) {
				return oValue.replace(/^[0]+/g, "");
			}
			return oValue;
		}

	});

});