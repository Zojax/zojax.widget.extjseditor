##############################################################################
#
# Copyright (c) 2009 Zope Foundation and Contributors.
# All Rights Reserved.
#
# This software is subject to the provisions of the Zope Public License,
# Version 2.1 (ZPL).  A copy of the ZPL should accompany this distribution.
# THIS SOFTWARE IS PROVIDED "AS IS" AND ANY AND ALL EXPRESS OR IMPLIED
# WARRANTIES ARE DISCLAIMED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF TITLE, MERCHANTABILITY, AGAINST INFRINGEMENT, AND FITNESS
# FOR A PARTICULAR PURPOSE.
#
##############################################################################
"""

$Id$
"""
from zope import schema, interface
from zope.i18nmessageid import MessageFactory

from z3c.schema.baseurl.field import BaseURL

_ = MessageFactory('zojax.widget.extjseditor')


class IExtJsEditor(interface.Interface):
    """ rich text field """

    kalturaPartnerId = schema.TextLine(title=_('Kaltura Partner Id'),
                                  required=False,)

    kalturaUserSecret = schema.TextLine(title=_('Kaltura User Secret'),
                                  required=False,)

    kalturaAdminSecret = schema.TextLine(title=_('Kaltura Admin Secret'),
                                  required=False,)

    kalturaServiceUrl = schema.TextLine(title=_('Kaltura Service URL'),
                            default = u'http://www.kaltura.com',
                            required=False,)

    kalturaServiceBase = schema.TextLine(title=_('Kaltura Service Base'),
                            default = u'/api_v3/index.php?service=',
                            required=False,)

    kalturaUserId = schema.TextLine(title=_('Kaltura User Id'),
                            required=False,)

    imageMaxWidth = schema.Int(
                        title=_('Max Image Width'),
                        description=_('The maximum width of the image is inserted via the wysiwyg-editor'),
                        default=480)

    imageMaxHeight = schema.Int(
                        title=_('Max Image Height'),
                        description=_('The maximum height of the image is inserted via the wysiwyg-editor'),
                        default=360)
#
    wistiaApiUsername = schema.TextLine(title=_('Wistia API Username'),
                                default = u'api',
                                required = False,)

    wistiaApiPassword = schema.TextLine(title=_('Wistia API Password'),
                                default = u'50fe24d3645fd924b3b2ce55aa061273104ecb40',
                                required = False,)

    wistiaBaseApiUrl = schema.TextLine(title=_('Wistia Base API URL'),
                        default = u'https://api.wistia.com/v1/',
                        required = False,)

    wistiaApiProxyUrl = schema.TextLine(title=_('Wistia API Proxy URL'),
        default = u'/WistiaJsAPI/',
        required = False,)

    autoUpload = schema.Bool(title=_('Allow image browser auto upload'),
        default = True,
        required = False,)