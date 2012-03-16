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

import os
import cgi
import urllib
import urllib2
import urlparse

from simplejson import JSONEncoder, loads

from zope import interface, event
from zope.component import getUtility

from z3c.form import interfaces

from ..interfaces import IExtJsEditor


class Encoder(JSONEncoder):

    def encode(self, *kv, **kw):
        return unicode(super(Encoder, self).encode(*kv, **kw))

encoder = JSONEncoder()

def jsonable(func):

    def cal(self):
        self.request.response.setHeader('Content-Type', ' application/json')
        return unicode(func(self)).encode('utf-8')
    return cal

def basic_auth_opener(uri, user, password):
    """
    Create opener with basic authentication support
    """
    passmgr = urllib2.HTTPPasswordMgrWithDefaultRealm()

    passmgr.add_password(realm=None,
                        uri=uri,
                        user=user,
                        passwd=password
                        )

    return urllib2.build_opener(urllib2.HTTPBasicAuthHandler(passmgr))


class WistiaApiProxy(object):
    """
        Proxy view for wistia.com x-domain js API calls.
        Examples of API calls:
            - path=projects.json?sort_by=name&sort_direction=1 - List projects;
            - path=projects/<project-id>.json - Show project;
            - path=projects/<project-id>/sharings.json - Show project sharings;
            - path=medias.json?sort_by=created&sort_direction=0&page=2&per_page=10 - paginated list of all the media;
                filtering:
                    * project_id - int;
                    * name - name exact match;
                    * type - Video|Audio|Image|PdfDocument|MicrosoftOfficeDocument|Swf|UnknownType;
                    * hashed_id - Find the media by hashed_id;
            - path=medias/<media-id>.json - Show media by id;
            - path=medias/<media-id>/stats.json - Show media stats;
            - path=medias/<media-id>/embed - Get embed code;

        More examples at http://wistia.com/doc/wistia_api.html

        """

    @jsonable
    def __call__(self):
        request = self.request
        configlet = getUtility(IExtJsEditor)

        urllib2.install_opener(basic_auth_opener(configlet.wistiaBaseApiUrl,
            configlet.wistiaApiUsername,
            configlet.wistiaApiPassword)
        )

        api_path = urlparse.urlparse(request.form.pop("path", "medias.json"))
#        start : 'page',
#        limit : 'per_page',
        qargs = cgi.parse_qs(api_path.query)
        if "start" in request.form and "limit" in request.form:
            try:
                qargs["page"] = int(request.form.pop("start")) / int(request.form["limit"]) + 1
                qargs["per_page"] = request.form.pop("limit")
            except (ZeroDivisionError, ValueError):
                pass

        qargs.update(request.form)

        qdata = urllib.urlencode(qargs, doseq=True)

        api_base = urlparse.urlparse(configlet.wistiaBaseApiUrl)

        api_url = urlparse.urlunparse((api_base.scheme,
                                       api_base.netloc,
                                       os.path.join(api_base.path, api_path.path),
                                       '',
                                       qdata if request.method == "GET" else '',
                                       ''))
        try:
            response = urllib2.urlopen(api_url, qdata if request.method == "POST" else None).read()
        except Exception, err:
            response = u"Error during request: %s" % err

        return response#encoder.encode(response)