sap.ui.define([
    "chocolatesexy/project/controller/shared/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("chocolatesexy.project.controller.main.Main", {

        onInit: function () {
      
            var sIgPost1 = 
                '<blockquote class="instagram-media" ' +
                'data-instgrm-captioned ' +
                'data-instgrm-permalink="https://www.instagram.com/p/DXmsUdYjZFS/?utm_source=ig_embed&amp;utm_campaign=loading" ' +
                'data-instgrm-version="14" ' +
                'style="background:#FFF;border:0;border-radius:0;' +
                'box-shadow:none;' +
                'margin:1px;max-width:540px;min-width:326px;padding:0;width:99.375%;">' +

                '<div style="padding:16px;">' +

                '<a href="https://www.instagram.com/p/DXmsUdYjZFS/?utm_source=ig_embed&amp;utm_campaign=loading" ' +
                'style="background:#FFFFFF;line-height:0;padding:0;text-align:center;text-decoration:none;width:100%;" ' +
                'target="_blank">' +

                '<div style="display:flex;flex-direction:row;align-items:center;">' +
                '<div style="background-color:#F4F4F4;border-radius:50%;flex-grow:0;height:40px;margin-right:14px;width:40px;"></div>' +

                '<div style="display:flex;flex-direction:column;flex-grow:1;justify-content:center;">' +
                '<div style="background-color:#F4F4F4;border-radius:4px;height:14px;margin-bottom:6px;width:100px;"></div>' +
                '<div style="background-color:#F4F4F4;border-radius:4px;height:14px;width:60px;"></div>' +
                '</div>' +
                '</div>' +

                '<div style="padding:19% 0;"></div>' +

                '<div style="display:block;height:50px;margin:0 auto 12px;width:50px;">' +
                '<svg width="50px" height="50px" viewBox="0 0 60 60" xmlns="https://www.w3.org/2000/svg">' +
                '<g fill="#000000">' +
                '<path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41"></path>' +
                '</g>' +
                '</svg>' +
                '</div>' +

                '<div style="padding-top:8px;">' +
                '<div style="color:#3897f0;font-family:Arial,sans-serif;font-size:14px;font-weight:550;line-height:18px;">' +
                'Ver esta publicación en Instagram' +
                '</div>' +
                '</div>' +

                '<div style="padding:12.5% 0;"></div>' +

                '<p style="color:#c9c8cd;font-family:Arial,sans-serif;font-size:14px;' +
                'line-height:17px;margin-bottom:0;margin-top:8px;overflow:hidden;' +
                'padding:8px 0 '

            var oModel = new JSONModel({
                igHtml1: sIgPost1
            });

            this.getView().setModel(oModel, "mainModel");
        },

        onAfterRendering: function () {
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }
        }

    });
});