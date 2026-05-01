# Document JSON metadata columns here so Claude knows what keys exist inside them.
# Structure: { "project.dataset.table": { "column_name": { "description": ..., "event_types": { ... } } } }
#
# Fill this in with your actual tables and event types before running.
# Ask your analysts for the most-used event types and keys.

JSON_METADATA_DOCS: dict = {
    "hopeful-list-429812-f3.events.funnel-raw-table": {
        "event_metadata": {
            "description": "JSON payload attached to each funnel event. Structure varies by event_name.",
            "event_types": {
                # ------------------------------------------------------------------ #
                #  CONVERSION EVENT                                                  #
                # ------------------------------------------------------------------ #
                "pr_funnel_subscribe": {
                    # Payment
                    "amount":                   "FLOAT   — charge amount in USD",
                    "currency":                 "STRING  — always 'USD'",
                    "subscription":             "STRING  — plan name (e.g. '4Week')",
                    "subscription_id":          "INTEGER — internal subscription ID",
                    "payment_type":             "STRING  — 'first' for new subscriptions",
                    "payment_method":           "STRING  — payment method (e.g. 'card')",
                    "channel":                  "STRING  — payment processor (e.g. 'primer')",
                    "status":                   "STRING  — payment status (e.g. 'settled')",
                    "3ds":                      "BOOLEAN — whether 3DS authentication was used",
                    "is_fallback":              "BOOLEAN — whether a fallback processor was used",
                    "mid_id":                   "STRING  — internal transaction / merchant ID",
                    "primer_id":                "STRING  — Primer payment gateway transaction ID",
                    "id":                       "STRING  — internal event/transaction identifier",
                    "requested_on":             "STRING  — ISO timestamp of payment request",
                    # Card details
                    "card_brand":               "STRING  — card brand (e.g. 'VISA')",
                    "card_type":                "STRING  — card type (e.g. 'CREDIT', 'DEBIT')",
                    "card_country":             "STRING  — ISO country code of issuing bank",
                    "card_last_4":              "STRING  — last 4 digits of card",
                    "card_expiration_month":    "STRING  — card expiry month",
                    "card_expiration_year":     "STRING  — card expiry year",
                    "bin":                      "STRING  — first 6 digits of card (BIN)",
                    "issuing_bank":             "STRING  — name of the issuing bank",
                    # User profile
                    "email":                    "STRING  — user email address",
                    "name":                     "STRING  — user full name",
                    "age":                      "STRING  — age bucket from quiz (e.g. '55+', '35-44')",
                    "gender":                   "STRING  — gender from quiz (e.g. 'Female', 'Male')",
                    "ip":                       "STRING  — user IP address",
                    "user_agent":               "STRING  — browser/device user agent string",
                    "email_consent":            "STRING  — email marketing consent flag",
                    "em_source":                "STRING  — email source identifier",
                    "em_template":              "STRING  — email template identifier",
                    # Location
                    "country_code":             "STRING  — ISO country code of user",
                    "country_name":             "STRING  — full country name",
                    "region":                   "STRING  — region/state",
                    "city":                     "STRING  — city name",
                    # Funnel / A-B test versions
                    "quiz_version":             "STRING  — A/B variant of the quiz (e.g. 'v7.0.0')",
                    "onboarding_version":       "STRING  — A/B variant of onboarding (e.g. 'o1.0.0_claude')",
                    "onboarding_version_mobile":"STRING  — mobile-specific onboarding variant",
                    "paywall_version":          "STRING  — A/B variant of paywall (e.g. 'default')",
                    "funnel_version":           "STRING  — A/B variant of the overall funnel",
                    "upsell_version":           "STRING  — A/B variant of upsell screen (e.g. 'u15.4.0')",
                    "pp_format":                "STRING  — personal plan format version",
                    "v3_selling_paywall":       "STRING  — selling paywall variant (e.g. 'primer')",
                    "personal_plan_pk":         "INTEGER — ID of personalized plan assigned to user",
                    # Cohort / retention
                    "cohort_date":              "INTEGER — cohort timestamp (Unix microseconds)",
                    "cohort_day":               "INTEGER — day number within cohort",
                    "cohort_week":              "INTEGER — week number within cohort",
                    "cohort_year":              "INTEGER — year of cohort",
                    # Funnel state flags
                    "chase":                    "BOOLEAN — whether user is in a chase/retargeting flow",
                    "super_chase":              "BOOLEAN — whether user is in a super-chase flow",
                    "reward_test":              "BOOLEAN — whether user is in a reward test",
                    # UTM attribution
                    "utm_source":               "STRING  — traffic source (e.g. 'facebook', 'google')",
                    "utm_campaign":             "STRING  — campaign identifier",
                    "utm_ad":                   "STRING  — ad identifier",
                    "utm_adgroupid":            "STRING  — ad group identifier",
                    "utm_adset":                "STRING  — ad set identifier",
                    "utm_placement":            "STRING  — placement (e.g. 'Facebook_Mobile_Feed')",
                    "utm_keyword":              "STRING  — keyword used in search campaigns",
                    "utm_assetgroup":           "STRING  — asset group identifier (Google)",
                },

                # ------------------------------------------------------------------ #
                #  PAYWALL EVENTS                                                     #
                # ------------------------------------------------------------------ #
                "pr_funnel_paywall_view": {
                    # Offer details
                    "amount":           "FLOAT   — displayed price on paywall in USD",
                    "currency":         "STRING  — always 'USD'",
                    "subscription":     "STRING  — plan name shown (e.g. '4Week')",
                    "subscription_id":  "INTEGER — internal subscription ID",
                    "channel":          "STRING  — payment processor (e.g. 'primer')",
                    "v3_selling_paywall":"STRING — selling paywall variant (e.g. 'primer')",
                    # User profile
                    "userId":           "INTEGER — internal user ID",
                    "id":               "INTEGER — alias for userId",
                    "email":            "STRING  — user email address",
                    "deviceId":         "STRING  — unique device identifier (UUID)",
                    "age":              "STRING  — age bucket from quiz (e.g. '35-44')",
                    "gender":           "STRING  — gender from quiz",
                    "goal":             "STRING  — primary goal selected in quiz",
                    "status":           "STRING  — employment status from quiz",
                    "language":         "STRING  — funnel language (e.g. 'en')",
                    "timezone":         "FLOAT   — user timezone offset (UTC+N)",
                    # Quiz / page position
                    "i":                "INTEGER — step index in quiz flow",
                    "order":            "INTEGER — display order of step",
                    "page_id":          "STRING  — ID of the paywall page",
                    "quiz_page_id":     "STRING  — ID of the quiz page that led here",
                    "tree_order":       "INTEGER — position in decision tree",
                    # Funnel / A-B test versions
                    "quiz_version":     "STRING  — quiz variant (e.g. 'v7.0.0')",
                    "paywall_version":  "STRING  — paywall variant (e.g. 'default')",
                    "funnel_version":   "STRING  — overall funnel variant",
                    # Funnel state flags
                    "chase":            "BOOLEAN — retargeting chase flow flag",
                    "super_chase":      "BOOLEAN — super-chase flow flag",
                    # Cohort
                    "cohort_date":      "INTEGER — cohort timestamp (Unix microseconds)",
                    # Device / screen
                    "screen_height":    "INTEGER — device screen height in px",
                    "screen_width":     "INTEGER — device screen width in px",
                    "viewport_height":  "INTEGER — browser viewport height in px",
                    "viewport_width":   "INTEGER — browser viewport width in px",
                    # UTM attribution
                    "utm_source":       "STRING  — traffic source",
                    "utm_campaign":     "STRING  — campaign identifier",
                    "utm_ad":           "STRING  — ad identifier",
                    "utm_adset":        "STRING  — ad set identifier",
                    "utm_adgroupid":    "STRING  — ad group identifier",
                    "utm_medium":       "STRING  — traffic medium (e.g. 'paid')",
                    "utm_placement":    "STRING  — placement (e.g. 'Instagram_Reels')",
                    "utm_content":      "STRING  — content/creative identifier",
                    "utm_id":           "STRING  — unified campaign ID",
                    "utm_term":         "STRING  — keyword or ad set term",
                    "utm_tag":          "STRING  — internal tracking tag (e.g. 'cld')",
                    "utm_assetgroup":   "STRING  — asset group identifier (Google)",
                    "utm_keyword":      "STRING  — keyword (Google Ads)",
                    "fbclid":           "STRING  — Facebook click ID for attribution",
                },

                "pr_funnel_paywall_purchase_click": {
                    # Offer at time of click
                    "amount":           "FLOAT   — price shown when user clicked purchase",
                    "currency":         "STRING  — always 'USD'",
                    "subscription":     "STRING  — plan selected (e.g. '4Week')",
                    "subscription_id":  "INTEGER — internal subscription ID",
                    "channel":          "STRING  — payment processor (e.g. 'primer')",
                    "payment_method":   "STRING  — payment method selected (e.g. 'card')",
                    "status":           "STRING  — user status from quiz (e.g. 'Exploring options')",
                    # User profile
                    "userId":           "INTEGER — internal user ID",
                    "deviceId":         "STRING  — unique device identifier (UUID)",
                    "age":              "STRING  — age bucket from quiz",
                    "gender":           "STRING  — gender from quiz",
                    "goal":             "STRING  — primary goal from quiz",
                    "language":         "STRING  — funnel language",
                    # Page context
                    "page_id":          "STRING  — ID of the paywall page",
                    # Funnel / A-B test versions
                    "quiz_version":     "STRING  — quiz variant",
                    # Funnel state flags
                    "chase":            "BOOLEAN — retargeting chase flow flag",
                    "super_chase":      "BOOLEAN — super-chase flow flag",
                    # Cohort
                    "cohort_date":      "INTEGER — cohort timestamp (Unix microseconds)",
                    # Device / screen
                    "screen_height":    "INTEGER — device screen height in px",
                    "screen_width":     "INTEGER — device screen width in px",
                    # UTM attribution
                    "utm_source":       "STRING  — traffic source",
                    "utm_campaign":     "STRING  — campaign identifier",
                    "utm_ad":           "STRING  — ad identifier",
                    "utm_adset":        "STRING  — ad set identifier",
                    "utm_medium":       "STRING  — traffic medium",
                    "utm_placement":    "STRING  — placement",
                    "utm_content":      "STRING  — content/creative identifier",
                    "utm_id":           "STRING  — unified campaign ID",
                    "utm_term":         "STRING  — keyword or ad set term",
                    "utm_assetgroup":   "STRING  — asset group identifier (Google)",
                    "fbclid":           "STRING  — Facebook click ID",
                },

                # ------------------------------------------------------------------ #
                #  SELLING / LANDING PAGE EVENTS                                     #
                # ------------------------------------------------------------------ #
                "pr_funnel_selling_page_view": {
                    # User profile
                    "userId":           "INTEGER — internal user ID",
                    "id":               "INTEGER — alias for userId",
                    "deviceId":         "STRING  — unique device identifier (UUID)",
                    "email":            "STRING  — user email address",
                    "age":              "STRING  — age bucket from quiz",
                    "gender":           "STRING  — gender from quiz",
                    "goal":             "STRING  — primary goal from quiz",
                    "status":           "STRING  — employment status from quiz",
                    "language":         "STRING  — funnel language",
                    "timezone":         "FLOAT   — user timezone offset",
                    "channel":          "STRING  — payment processor variant",
                    # Quiz / page position
                    "i":                "INTEGER — step index in quiz flow",
                    "order":            "INTEGER — display order of step",
                    "page_id":          "STRING  — ID of the selling page",
                    "quiz_page_id":     "STRING  — ID of the referring quiz page",
                    "tree_order":       "INTEGER — position in decision tree",
                    # Funnel / A-B test versions
                    "quiz_version":     "STRING  — quiz variant",
                    "paywall_version":  "STRING  — paywall variant",
                    "v3_selling_paywall":"STRING — selling paywall variant",
                    # Funnel state flags
                    "chase":            "BOOLEAN — retargeting chase flow flag",
                    "super_chase":      "BOOLEAN — super-chase flow flag",
                    # Cohort
                    "cohort_date":      "INTEGER — cohort timestamp (Unix microseconds)",
                    # Device / screen
                    "screen_height":    "INTEGER — device screen height in px",
                    "screen_width":     "INTEGER — device screen width in px",
                    "viewport_height":  "INTEGER — browser viewport height in px",
                    "viewport_width":   "INTEGER — browser viewport width in px",
                    # UTM attribution
                    "utm_source":       "STRING  — traffic source",
                    "utm_campaign":     "STRING  — campaign identifier",
                    "utm_ad":           "STRING  — ad identifier",
                    "utm_adgroupid":    "STRING  — ad group identifier",
                    "utm_medium":       "STRING  — traffic medium",
                    "utm_content":      "STRING  — content/creative identifier",
                    "utm_keyword":      "STRING  — keyword (Google Ads)",
                    "utm_tag":          "STRING  — internal tracking tag",
                    "gclid":            "STRING  — Google click ID for attribution",
                    "gad_source":       "STRING  — Google Ads source identifier",
                    "gad_campaignid":   "STRING  — Google Ads campaign ID",
                },

                "pr_funnel_landing_page_view": {
                    # User profile
                    "deviceId":         "STRING  — unique device identifier (UUID)",
                    "age":              "STRING  — age bucket from quiz",
                    "gender":           "STRING  — gender from quiz",
                    "goal":             "STRING  — primary goal from quiz",
                    "status":           "STRING  — employment status from quiz",
                    "language":         "STRING  — funnel language",
                    "timezone":         "FLOAT   — user timezone offset",
                    "channel":          "STRING  — payment processor variant",
                    # Quiz / page position
                    "i":                "INTEGER — step index in quiz flow",
                    "order":            "INTEGER — display order of step (0 = entry)",
                    "page_id":          "STRING  — ID of the landing page",
                    "quiz_page_id":     "STRING  — ID of the associated quiz page",
                    "tree_order":       "INTEGER — position in decision tree",
                    # Funnel / A-B test versions
                    "quiz_version":     "STRING  — quiz variant (e.g. 'v7.2.4')",
                    "paywall_version":  "STRING  — paywall variant",
                    "v3_selling_paywall":"STRING — selling paywall variant",
                    # Funnel state flags
                    "chase":            "BOOLEAN — retargeting chase flow flag",
                    "super_chase":      "BOOLEAN — super-chase flow flag",
                    # Cohort
                    "cohort_date":      "INTEGER — cohort timestamp (Unix microseconds)",
                    # Device / screen
                    "screen_height":    "INTEGER — device screen height in px",
                    "screen_width":     "INTEGER — device screen width in px",
                    "viewport_height":  "INTEGER — browser viewport height in px",
                    "viewport_width":   "INTEGER — browser viewport width in px",
                    # UTM attribution
                    "utm_source":       "STRING  — traffic source",
                    "utm_campaign":     "STRING  — campaign identifier",
                    "utm_ad":           "STRING  — ad identifier",
                    "utm_adset":        "STRING  — ad set identifier",
                    "utm_medium":       "STRING  — traffic medium",
                    "utm_content":      "STRING  — content/creative identifier",
                    "utm_id":           "STRING  — unified campaign ID",
                    "utm_term":         "STRING  — keyword or ad set term",
                    "utm_tag":          "STRING  — internal tracking tag",
                    "fbclid":           "STRING  — Facebook click ID",
                },

                # ------------------------------------------------------------------ #
                #  EMAIL CAPTURE EVENTS                                              #
                # ------------------------------------------------------------------ #
                "pr_funnel_email_page_view": {
                    # User profile
                    "deviceId":         "STRING  — unique device identifier (UUID)",
                    "age":              "STRING  — age bucket from quiz",
                    "gender":           "STRING  — gender from quiz",
                    "goal":             "STRING  — primary goal from quiz",
                    "status":           "STRING  — employment status from quiz",
                    "language":         "STRING  — funnel language",
                    "timezone":         "FLOAT   — user timezone offset",
                    "channel":          "STRING  — payment processor variant",
                    # Quiz / page position
                    "i":                "INTEGER — step index in quiz flow",
                    "order":            "INTEGER — display order of step",
                    "page_id":          "STRING  — ID of the email capture page",
                    "quiz_page_id":     "STRING  — ID of the referring quiz page",
                    "tree_order":       "INTEGER — position in decision tree",
                    # Funnel / A-B test versions
                    "quiz_version":     "STRING  — quiz variant",
                    "paywall_version":  "STRING  — paywall variant",
                    "v3_selling_paywall":"STRING — selling paywall variant",
                    # Funnel state flags
                    "chase":            "BOOLEAN — retargeting chase flow flag",
                    "super_chase":      "BOOLEAN — super-chase flow flag",
                    # Cohort
                    "cohort_date":      "INTEGER — cohort timestamp (Unix microseconds)",
                    # Device / screen
                    "screen_height":    "INTEGER — device screen height in px",
                    "screen_width":     "INTEGER — device screen width in px",
                    "viewport_height":  "INTEGER — browser viewport height in px",
                    "viewport_width":   "INTEGER — browser viewport width in px",
                    # UTM attribution
                    "utm_source":       "STRING  — traffic source",
                    "utm_campaign":     "STRING  — campaign identifier",
                    "utm_ad":           "STRING  — ad identifier",
                    "utm_adset":        "STRING  — ad set identifier",
                    "utm_medium":       "STRING  — traffic medium",
                    "utm_content":      "STRING  — content/creative identifier",
                    "utm_id":           "STRING  — unified campaign ID",
                    "utm_term":         "STRING  — keyword or ad set term",
                    "fbclid":           "STRING  — Facebook click ID",
                },

                "pr_funnel_email_submit": {
                    # User profile (now includes email since user just submitted it)
                    "userId":           "INTEGER — internal user ID assigned after email submit",
                    "id":               "INTEGER — alias for userId",
                    "deviceId":         "STRING  — unique device identifier (UUID)",
                    "email":            "STRING  — email address submitted by user",
                    "consent":          "BOOLEAN — whether user gave marketing consent",
                    "age":              "STRING  — age bucket from quiz",
                    "gender":           "STRING  — gender from quiz",
                    "goal":             "STRING  — primary goal from quiz",
                    "status":           "STRING  — employment status from quiz",
                    "language":         "STRING  — funnel language",
                    "timezone":         "FLOAT   — user timezone offset",
                    "channel":          "STRING  — payment processor variant",
                    # Quiz / page position
                    "i":                "INTEGER — step index in quiz flow",
                    "order":            "INTEGER — display order of step",
                    "page_id":          "STRING  — ID of the email submit page",
                    "quiz_page_id":     "STRING  — ID of the referring quiz page",
                    "tree_order":       "INTEGER — position in decision tree",
                    # Funnel / A-B test versions
                    "quiz_version":     "STRING  — quiz variant",
                    "paywall_version":  "STRING  — paywall variant",
                    "v3_selling_paywall":"STRING — selling paywall variant",
                    # Funnel state flags
                    "chase":            "BOOLEAN — retargeting chase flow flag",
                    "super_chase":      "BOOLEAN — super-chase flow flag",
                    # Cohort
                    "cohort_date":      "INTEGER — cohort timestamp (Unix microseconds)",
                    # Device / screen
                    "screen_height":    "INTEGER — device screen height in px",
                    "screen_width":     "INTEGER — device screen width in px",
                    "viewport_height":  "INTEGER — browser viewport height in px",
                    "viewport_width":   "INTEGER — browser viewport width in px",
                    # UTM attribution
                    "utm_source":       "STRING  — traffic source",
                    "utm_campaign":     "STRING  — campaign identifier",
                    "utm_ad":           "STRING  — ad identifier",
                    "utm_adset":        "STRING  — ad set identifier",
                    "utm_medium":       "STRING  — traffic medium",
                    "utm_content":      "STRING  — content/creative identifier",
                    "utm_id":           "STRING  — unified campaign ID",
                    "utm_term":         "STRING  — keyword or ad set term",
                    "utm_tag":          "STRING  — internal tracking tag",
                    "fbclid":           "STRING  — Facebook click ID",
                },

                # ------------------------------------------------------------------ #
                #  QUIZ FLOW EVENTS                                                  #
                # ------------------------------------------------------------------ #
                "pr_funnel_click": {
                    # Answer content
                    "page_id":          "STRING  — ID of the question page",
                    "quiz_page_id":     "STRING  — quiz page ID (may differ from page_id)",
                    "key_value":        "STRING  — slug identifying the question topic (e.g. 'hours_work', 'gender', 'goal')",
                    "question_text":    "STRING  — full text of the question shown",
                    "question_answer":  "STRING  — answer the user selected",
                    "question_type":    "STRING  — format: 'single-select-quiz', 'multi-select', or 'teaser'",
                    "label":            "STRING  — display label of the selected answer",
                    "value":            "STRING  — raw value of the selected answer",
                    # Quiz / page position
                    "i":                "INTEGER — step index in quiz flow (use for ordering answers chronologically)",
                    "order":            "INTEGER — display order of step",
                    "tree_order":       "INTEGER — position in decision tree",
                    # User profile (collected so far at point of click)
                    "deviceId":         "STRING  — unique device identifier (UUID)",
                    "age":              "STRING  — age bucket (if already answered)",
                    "gender":           "STRING  — gender (if already answered)",
                    "goal":             "STRING  — goal (if already answered)",
                    "status":           "STRING  — employment status (if already answered)",
                    "language":         "STRING  — funnel language",
                    "timezone":         "FLOAT   — user timezone offset",
                    "channel":          "STRING  — payment processor variant",
                    # Funnel / A-B test versions
                    "quiz_version":     "STRING  — quiz variant",
                    "paywall_version":  "STRING  — paywall the user will see",
                    "v3_selling_paywall":"STRING — selling paywall variant",
                    # Funnel state flags
                    "chase":            "BOOLEAN — retargeting chase flow flag",
                    "super_chase":      "BOOLEAN — super-chase flow flag",
                    # Email / AppsFlyer attribution IDs (present for re-engagement flows)
                    "alart":            "STRING  — AppsFlyer re-attribution token",
                    "aleid":            "STRING  — AppsFlyer engagement ID",
                    # Cohort
                    "cohort_date":      "INTEGER — cohort timestamp (Unix microseconds)",
                    # Device / screen
                    "screen_height":    "INTEGER — device screen height in px",
                    "screen_width":     "INTEGER — device screen width in px",
                    "viewport_height":  "INTEGER — browser viewport height in px",
                    "viewport_width":   "INTEGER — browser viewport width in px",
                    # UTM attribution
                    "utm_source":       "STRING  — traffic source",
                    "utm_campaign":     "STRING  — campaign identifier",
                    "utm_ad":           "STRING  — ad identifier",
                    "utm_adset":        "STRING  — ad set identifier",
                    "utm_medium":       "STRING  — traffic medium",
                    "utm_content":      "STRING  — content/creative identifier",
                    "utm_term":         "STRING  — keyword or ad set term",
                },

                "pr_funnel_loader_view": {
                    # User profile
                    "deviceId":         "STRING  — unique device identifier (UUID)",
                    "age":              "STRING  — age bucket from quiz",
                    "gender":           "STRING  — gender from quiz",
                    "goal":             "STRING  — primary goal from quiz",
                    "status":           "STRING  — employment status from quiz",
                    "language":         "STRING  — funnel language",
                    "timezone":         "FLOAT   — user timezone offset",
                    "channel":          "STRING  — payment processor variant",
                    # Quiz / page position
                    "i":                "INTEGER — step index in quiz flow",
                    "order":            "INTEGER — display order of step",
                    "page_id":          "STRING  — ID of the loader page",
                    "quiz_page_id":     "STRING  — ID of the referring quiz page",
                    "tree_order":       "INTEGER — position in decision tree",
                    # Funnel / A-B test versions
                    "quiz_version":     "STRING  — quiz variant",
                    "paywall_version":  "STRING  — paywall variant",
                    "v3_selling_paywall":"STRING — selling paywall variant",
                    # Funnel state flags
                    "chase":            "BOOLEAN — retargeting chase flow flag",
                    "super_chase":      "BOOLEAN — super-chase flow flag",
                    # Cohort
                    "cohort_date":      "INTEGER — cohort timestamp (Unix microseconds)",
                    # Device / screen
                    "screen_height":    "INTEGER — device screen height in px",
                    "screen_width":     "INTEGER — device screen width in px",
                    "viewport_height":  "INTEGER — browser viewport height in px",
                    "viewport_width":   "INTEGER — browser viewport width in px",
                    # UTM attribution (Google flow example)
                    "utm_source":       "STRING  — traffic source",
                    "utm_campaign":     "STRING  — campaign identifier",
                    "utm_ad":           "STRING  — ad identifier",
                    "utm_adgroupid":    "STRING  — ad group identifier",
                    "utm_content":      "STRING  — content/creative identifier",
                    "utm_keyword":      "STRING  — keyword (Google Ads)",
                    "utm_tag":          "STRING  — internal tracking tag",
                    "gclid":            "STRING  — Google click ID",
                    "gad_source":       "STRING  — Google Ads source identifier",
                    "gad_campaignid":   "STRING  — Google Ads campaign ID",
                },
            },
        }
    },
}
