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

from zojax.layoutform import PageletDisplayForm, Fields
from zojax.content.type.item import PersistentItem
from zojax.richtext.field import RichText, RichTextProperty


class IPage(interface.Interface):

    title = schema.TextLine(
        title = u'Title',
        description = u'Page title.',
        required = True)

    description = schema.Text(
        title = u'Description',
        description = u'A short summary of the content.',
        required = False)

    text = RichText(
        title = u'Body',
        description = u'Page body text.',
        required = True)


class Page(PersistentItem):
    interface.implements(IPage)

    text = RichTextProperty(IPage['text'])


class ContentDisplayForm(PageletDisplayForm):

    fields = Fields(IPage)
