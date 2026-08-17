import 'package:flutter/material.dart';

import 'app_localizations.dart';

/// Localization delegates for Conduit's standalone Material and Cupertino UI.
const List<LocalizationsDelegate<dynamic>> conduitLocalizationsDelegates =
    <LocalizationsDelegate<dynamic>>[
      AppLocalizations.delegate,
      ...GlobalMaterialLocalizations.delegates,
    ];
