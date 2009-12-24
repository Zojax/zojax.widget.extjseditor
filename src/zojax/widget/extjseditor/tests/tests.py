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
""" zojax.profile.manager tests

$Id$
"""
import os, unittest, doctest
from zope import interface, component
from zope.app.rotterdam import Rotterdam
from zojax.filefield.testing import ZCMLLayer, FunctionalDocFileSuite
from zojax.layoutform.interfaces import ILayoutFormLayer


zojaxExtJSEditorLayer = ZCMLLayer(
    os.path.join(os.path.split(__file__)[0], 'ftesting.zcml'),
    __name__, 'zojaxExtJSEditorLayer', allow_teardown=True)


def getPath(filename):
    return os.path.join(os.path.dirname(__file__), filename)


class IDefaultSkin(ILayoutFormLayer, Rotterdam):
    """ skin """


def test_suite():
    testbrowser = FunctionalDocFileSuite(
        "testbrowser.txt",
        optionflags=doctest.ELLIPSIS|doctest.NORMALIZE_WHITESPACE)
    testbrowser.layer = zojaxExtJSEditorLayer

    return unittest.TestSuite((testbrowser, ))
