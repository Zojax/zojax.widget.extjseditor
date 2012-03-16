// Ext.ux.MediaBrowser
// an media browser for the Ext.ux.HtmlEditorMedia plugin

new Ext.ux.HTMLEditorMedia(
   {
        "kaltura":
       {
           "serviceBase": "/api_v3/index.php?service=",
           "partnerId": "101",
           "serviceUrl": "http://vidman.quickoasis.com",
           "userSecret": "6bdda497108b2dc5e7373415e1a30f3d",
           "userId": "hariprasad_duggi@qintl.com",
           "adminSecret": "72b100895eaabcfe0806731ff5b76aad"
       },
       "mediaAPIUrl": "/mediaBrowser/",
       "mediaUrl1": "http://localhost:8080/QuickIntranet/@@content.attachments/1288684182/mediaManagerAPI/",
       "mediaUrl2": "http://localhost:8080/QuickIntranet/@@content.attachments/1390488629/mediaManagerAPI/"
   }
)

new Ext.ux.HTMLEditorMedia({
    "wistia":
        {
            "serviceBase": "/api_v3/index.php?service=",
            "serviceUrl": "http://vidman.quickoasis.com",
            "password": "4fe1a26e3c0d47107becf5223870ec81f70a9c2d",
            "username": "api"
        },
        "mediaAPIUrl": "/mediaBrowser/",
        "mediaUrl1": "http://localhost:8080/QuickIntranet/@@content.attachments/1288684182/mediaManagerAPI/",
        "mediaUrl2": "http://localhost:8080/QuickIntranet/@@content.attachments/1390488629/mediaManagerAPI/"
    }
)
