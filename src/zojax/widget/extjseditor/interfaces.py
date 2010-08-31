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

    mediaAPIURL = schema.TextLine(title=_('Media API URL'),
                                  required=False,)

    kalturaPartnerId = schema.TextLine(title=_('Kaltura Partner Id'),
                                  required=False,)

    kalturaUserSecret = schema.TextLine(title=_('Kaltura User Secret'),
                                  required=False,)

    kalturaAdminSecret = schema.TextLine(title=_('Kaltura Admin Secret'),
                                  required=False,)

    kalturaApiURL = BaseURL(title=_('Kaltura User Secret'),
                            default = 'http://www.kaltura.com/api/',
                            required=False,)

    kalturaUserId = schema.TextLine(title=_('Kaltura User Id'),
                            required=False,)

