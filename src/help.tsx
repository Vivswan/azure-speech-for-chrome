import React from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from './localization/translation'

function Help() {
  const { t, locale } = useTranslation()

  // Update document title when locale changes
  React.useEffect(() => {
    if (t('help.title')) {
      document.title = `${t('extension.name')} | ${t('help.title')}`
    }
  }, [locale, t])

  return (
    <div className="flex justify-center bg-neutral-50 bg-opacity-30">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl p-8">
        <div className="flex flex-col justify-center gap-6 pt-8">
          <div className="flex justify-center">
            <div className="flex items-center text-center">
              <img
                src="images/icon_1000.png"
                alt="Azure Speech for Chrome"
                className="mr-4 pt-0.5"
                style={{ width: '64px' }}
              />
              <div>
                <div className="text-4xl font-bold text-neutral-800">
                  {t('extension.name')}
                </div>
                <div
                  className="text-2xl font-bold text-neutral-500"
                  style={{ marginTop: '-5px' }}
                >
                  {t('help.title')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl p-6 space-y-8">

          {/* Getting Started */}
          <Section
            title={t('help.getting_started.title')}
            content={
              <div className="space-y-4">
                <p className="text-gray-700">
                  {t('help.getting_started.description')}
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <p className="text-blue-800 font-semibold">{t('help.getting_started.prerequisites')}</p>
                  <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
                    <li>{t('help.getting_started.azure_account')}</li>
                    <li>{t('help.getting_started.resource_understanding')}</li>
                  </ul>
                </div>
              </div>
            }
          />

          {/* Azure Setup */}
          <Section
            title={t('help.azure_setup.title')}
            content={
              <div className="space-y-6">
                <Step
                  number="1"
                  title={t('help.azure_setup.create_account.title')}
                  content={
                    <div>
                      <p>{t('help.azure_setup.create_account.description')}</p>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>{t('help.azure_setup.create_account.step1')} <a href="https://azure.microsoft.com" target="_blank"
                                     className="text-blue-600 hover:underline">azure.microsoft.com</a></li>
                        <li>{t('help.azure_setup.create_account.step2')}</li>
                        <li>{t('help.azure_setup.create_account.step3')}</li>
                        <li>{t('help.azure_setup.create_account.step4')}</li>
                      </ol>
                    </div>
                  }
                />

                <Step
                  number="2"
                  title={t('help.azure_setup.create_resource.title')}
                  content={
                    <div>
                      <p>{t('help.azure_setup.create_resource.description')}</p>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>{t('help.azure_setup.create_resource.step1')}</li>
                        <li>{t('help.azure_setup.create_resource.step2')}</li>
                        <li>{t('help.azure_setup.create_resource.step3')}</li>
                        <li>{t('help.azure_setup.create_resource.step4')}</li>
                        <li>{t('help.azure_setup.create_resource.step5')}</li>
                        <li>{t('help.azure_setup.create_resource.step6')}</li>
                        <li>{t('help.azure_setup.create_resource.step7')}</li>
                        <li>{t('help.azure_setup.create_resource.step8')}</li>
                      </ol>
                    </div>
                  }
                />

                <Step
                  number="3"
                  title={t('help.azure_setup.get_keys.title')}
                  content={
                    <div>
                      <p>{t('help.azure_setup.get_keys.description')}</p>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>{t('help.azure_setup.get_keys.step1')}</li>
                        <li>{t('help.azure_setup.get_keys.step2')}</li>
                        <li>{t('help.azure_setup.get_keys.step3')}</li>
                        <li>{t('help.azure_setup.get_keys.step4')}</li>
                      </ol>
                      <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
                        <p
                          className="text-red-800 font-semibold">{t('help.azure_setup.get_keys.security_warning')}</p>
                        <p className="text-red-700 mt-1">
                          {t('help.azure_setup.get_keys.security_text')}
                        </p>
                      </div>
                    </div>
                  }
                />

                <Step
                  number="4"
                  title={t('help.azure_setup.choose_region.title')}
                  content={
                    <div>
                      <p>{t('help.azure_setup.choose_region.description')}</p>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <strong>{t('help.azure_setup.choose_region.popular_regions')}</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                            <li><code>eastus</code> - {t('help.azure_setup.choose_region.us_east')}</li>
                            <li><code>westus2</code> - {t('help.azure_setup.choose_region.us_west')}</li>
                            <li><code>westeurope</code> - {t('help.azure_setup.choose_region.eu_west')}</li>
                            <li><code>southeastasia</code> - {t('help.azure_setup.choose_region.ap_southeast')}</li>
                          </ul>
                        </div>
                        <div>
                          <strong>{t('help.azure_setup.choose_region.all_regions')}</strong>
                          <p className="text-sm mt-2">
                            <a href="https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/regions" target="_blank"
                               className="text-blue-600 hover:underline">{t('help.azure_setup.choose_region.see_docs')}</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                />
              </div>
            }
          />

          {/* Extension Setup */}
          <Section
            title={t('help.extension_setup.title')}
            content={
              <div className="space-y-4">
                <Step
                  number="1"
                  title={t('help.extension_setup.enter_credentials.title')}
                  content={
                    <div>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>{t('help.extension_setup.enter_credentials.step1')}</li>
                        <li>{t('help.extension_setup.enter_credentials.step2')}</li>
                        <li>{t('help.extension_setup.enter_credentials.step3')}</li>
                        <li>{t('help.extension_setup.enter_credentials.step4')}</li>
                        <li>{t('help.extension_setup.enter_credentials.step5')}</li>
                      </ol>
                    </div>
                  }
                />

                <Step
                  number="2"
                  title={t('help.extension_setup.customize_settings.title')}
                  content={
                    <div>
                      <p>{t('help.extension_setup.customize_settings.description')}</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>{t('help.extension_setup.customize_settings.language')}</li>
                        <li>{t('help.extension_setup.customize_settings.engine')}</li>
                        <li>{t('help.extension_setup.customize_settings.voice')}</li>
                        <li>{t('help.extension_setup.customize_settings.speed')}</li>
                        <li>{t('help.extension_setup.customize_settings.pitch')}</li>
                        <li>{t('help.extension_setup.customize_settings.volume')}</li>
                      </ul>
                    </div>
                  }
                />
              </div>
            }
          />

          {/* Usage Guide */}
          <Section
            title={t('help.usage.title')}
            content={
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3">{t('help.usage.context_menu.title')}</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>{t('help.usage.context_menu.step1')}</li>
                      <li>{t('help.usage.context_menu.step2')}</li>
                      <li>{t('help.usage.context_menu.step3')}
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>{t('help.usage.context_menu.read_aloud')}</li>
                          <li>{t('help.usage.context_menu.read_aloud_1x')}</li>
                          <li>{t('help.usage.context_menu.read_aloud_15x')}</li>
                          <li>{t('help.usage.context_menu.read_aloud_2x')}</li>
                          <li>{t('help.usage.context_menu.download_mp3')}</li>
                        </ul>
                      </li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-3">{t('help.usage.keyboard_shortcuts.title')}</h4>
                    <ul className="space-y-2">
                      <li><kbd
                        className="px-2 py-1 bg-gray-200 rounded">Ctrl+Shift+S</kbd> - {t('help.usage.keyboard_shortcuts.read_aloud_shortcut')}
                      </li>
                      <li><kbd
                        className="px-2 py-1 bg-gray-200 rounded">Ctrl+Shift+E</kbd> - {t('help.usage.keyboard_shortcuts.download_shortcut')}
                      </li>
                      <li className="text-sm text-gray-600">{t('help.usage.keyboard_shortcuts.mac_note')}</li>
                      <li className="text-sm text-gray-600">{t('help.usage.keyboard_shortcuts.customize_note')}</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <p className="text-green-800 font-semibold">{t('help.usage.pro_tips.title')}</p>
                  <ul className="list-disc list-inside text-green-700 mt-2 space-y-1">
                    <li>{t('help.usage.pro_tips.tip1')}</li>
                    <li>{t('help.usage.pro_tips.tip2')}</li>
                    <li>{t('help.usage.pro_tips.tip3')}</li>
                    <li>{t('help.usage.pro_tips.tip4')}</li>
                    <li>{t('help.usage.pro_tips.tip5')}</li>
                    <li>{t('help.usage.pro_tips.tip6')}</li>
                    <li>{t('help.usage.pro_tips.tip7')}</li>
                  </ul>
                </div>
              </div>
            }
          />

          {/* Text Processing */}
          <Section
            title={t('help.text_processing.title')}
            content={
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{t('help.text_processing.smart_sanitization.title')}</h4>
                  <p className="mb-3">{t('help.text_processing.smart_sanitization.description')}</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('help.text_processing.smart_sanitization.html_removal')}</li>
                    <li>{t('help.text_processing.smart_sanitization.special_chars')}</li>
                    <li>{t('help.text_processing.smart_sanitization.script_protection')}</li>
                    <li>{t('help.text_processing.smart_sanitization.entity_decoding')}</li>
                    <li>{t('help.text_processing.smart_sanitization.ssml_preservation')}</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <p className="text-blue-800 font-semibold">{t('help.text_processing.examples.title')}</p>
                  <div className="text-blue-700 mt-2 space-y-2">
                    <div>
                      <p className="font-medium">{t('help.text_processing.examples.html_content')}</p>
                      <code
                        className="text-xs bg-blue-100 px-2 py-1 rounded">{t('help.text_processing.examples.html_example')}</code>
                      <p className="text-sm mt-1">{t('help.text_processing.examples.html_result')}</p>
                    </div>
                    <div>
                      <p className="font-medium">{t('help.text_processing.examples.special_content')}</p>
                      <code
                        className="text-xs bg-blue-100 px-2 py-1 rounded">{t('help.text_processing.examples.special_example')}</code>
                      <p className="text-sm mt-1">{t('help.text_processing.examples.special_result')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">{t('help.text_processing.what_to_select.title')}</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('help.text_processing.what_to_select.plain_text')}</li>
                    <li>{t('help.text_processing.what_to_select.html_text')}</li>
                    <li>{t('help.text_processing.what_to_select.special_chars')}</li>
                    <li>{t('help.text_processing.what_to_select.form_inputs')}</li>
                    <li>{t('help.text_processing.what_to_select.ssml_markup')}</li>
                    <li>{t('help.text_processing.what_to_select.mixed_content')}</li>
                  </ul>
                </div>
              </div>
            }
          />

          {/* Features */}
          <Section
            title={t('help.audio_features.title')}
            content={
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">{t('help.audio_features.download_formats.title')}</h4>
                    <ul className="space-y-1">
                      <li>{t('help.audio_features.download_formats.mp3_64')}</li>
                      <li>{t('help.audio_features.download_formats.mp3_32')}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('help.audio_features.playback_formats.title')}</h4>
                    <ul className="space-y-1">
                      <li>{t('help.audio_features.playback_formats.ogg')}</li>
                      <li>{t('help.audio_features.playback_formats.mp3')}</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">{t('help.audio_features.ssml_support.title')}</h4>
                  <p className="mb-2">{t('help.audio_features.ssml_support.description')}</p>
                  <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                    &lt;speak&gt;<br />
                    &nbsp;&nbsp;{t('help.audio_features.ssml_support.example_hello')} &lt;break
                    time="1s"/&gt; {t('help.audio_features.ssml_support.example_world')}!<br />
                    &nbsp;&nbsp;&lt;prosody
                    rate="slow"&gt;{t('help.audio_features.ssml_support.example_slow_text')}&lt;/prosody&gt;<br />
                    &lt;/speak&gt;
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    <a href="https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup" target="_blank"
                       className="text-blue-600 hover:underline">{t('help.audio_features.ssml_support.learn_more')}</a>
                  </p>
                </div>
              </div>
            }
          />

          {/* Pricing */}
          <Section
            title={t('help.pricing.title')}
            content={
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <p className="text-blue-800 font-semibold">{t('help.pricing.free_tier.title')}</p>
                  <p className="text-blue-700 mt-1">
                    {t('help.pricing.free_tier.description')}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">{t('help.pricing.neural_voices.title')}</h4>
                  <ul className="space-y-1 text-sm">
                    <li>{t('help.pricing.neural_voices.price_million')}</li>
                    <li>{t('help.pricing.neural_voices.price_char')}</li>
                    <li>{t('help.pricing.neural_voices.description')}</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-yellow-800 font-semibold">{t('help.pricing.cost_optimization.title')}</p>
                  <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                    <li>{t('help.pricing.cost_optimization.tip1')}</li>
                    <li>{t('help.pricing.cost_optimization.tip2')}</li>
                    <li>{t('help.pricing.cost_optimization.tip3')}</li>
                    <li>{t('help.pricing.cost_optimization.tip4')}</li>
                  </ul>
                </div>

                <p className="text-sm text-gray-600">
                  <a href="https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/" target="_blank"
                     className="text-blue-600 hover:underline">{t('help.pricing.current_pricing')}</a>
                </p>
              </div>
            }
          />

          {/* Troubleshooting */}
          <Section
            title={t('help.troubleshooting.title')}
            content={
              <div className="space-y-4">
                <TroubleshootItem
                  problem={t('help.troubleshooting.credentials_invalid.problem')}
                  solution={
                    <ul className="list-disc list-inside space-y-1">
                      <li>{t('help.troubleshooting.credentials_invalid.solution1')}</li>
                      <li>{t('help.troubleshooting.credentials_invalid.solution2')}</li>
                      <li>{t('help.troubleshooting.credentials_invalid.solution3')}</li>
                      <li>{t('help.troubleshooting.credentials_invalid.solution4')}</li>
                    </ul>
                  }
                />

                <TroubleshootItem
                  problem={t('help.troubleshooting.no_audio.problem')}
                  solution={
                    <ul className="list-disc list-inside space-y-1">
                      <li>{t('help.troubleshooting.no_audio.solution1')}</li>
                      <li>{t('help.troubleshooting.no_audio.solution2')}</li>
                      <li>{t('help.troubleshooting.no_audio.solution3')}</li>
                      <li>{t('help.troubleshooting.no_audio.solution4')}</li>
                    </ul>
                  }
                />

                <TroubleshootItem
                  problem={t('help.troubleshooting.access_denied.problem')}
                  solution={
                    <ul className="list-disc list-inside space-y-1">
                      <li>{t('help.troubleshooting.access_denied.solution1')}</li>
                      <li>{t('help.troubleshooting.access_denied.solution2')}</li>
                      <li>{t('help.troubleshooting.access_denied.solution3')}</li>
                      <li>{t('help.troubleshooting.access_denied.solution4')}</li>
                    </ul>
                  }
                />

                <TroubleshootItem
                  problem={t('help.troubleshooting.unexpected_charges.problem')}
                  solution={
                    <ul className="list-disc list-inside space-y-1">
                      <li>{t('help.troubleshooting.unexpected_charges.solution1')}</li>
                      <li>{t('help.troubleshooting.unexpected_charges.solution2')}</li>
                      <li>{t('help.troubleshooting.unexpected_charges.solution3')}</li>
                      <li>{t('help.troubleshooting.unexpected_charges.solution4')}</li>
                    </ul>
                  }
                />
              </div>
            }
          />

          {/* Support */}
          <Section
            title={t('help.support.title')}
            content={
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">{t('help.support.extension_issues.title')}</h4>
                    <ul className="space-y-2">
                      <li>
                        <a href="https://github.com/vivswan/azure-speech-for-chrome/issues" target="_blank"
                           className="text-blue-600 hover:underline">
                          {t('help.support.extension_issues.report_bugs')}
                        </a>
                      </li>
                      <li>
                        <a href="https://github.com/vivswan/azure-speech-for-chrome" target="_blank"
                           className="text-blue-600 hover:underline">
                          {t('help.support.extension_issues.view_source')}
                        </a>
                      </li>
                      <li>
                        <a href="https://vivswan.github.io/azure-speech-for-chrome/privacy-policy.html" target="_blank"
                           className="text-blue-600 hover:underline">
                          {t('help.support.extension_issues.privacy_policy')}
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('help.support.azure_support.title')}</h4>
                    <ul className="space-y-2">
                      <li>
                        <a href="https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/" target="_blank"
                           className="text-blue-600 hover:underline">
                          {t('help.support.azure_support.documentation')}
                        </a>
                      </li>
                      <li>
                        <a href="https://azure.microsoft.com/en-us/support/" target="_blank"
                           className="text-blue-600 hover:underline">
                          {t('help.support.azure_support.support_center')}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 border-l-4 border-gray-400 p-4">
                  <p className="text-gray-800 font-semibold">{t('help.support.community.title')}</p>
                  <p className="text-gray-700 mt-1">
                    {t('help.support.community.description')}
                  </p>
                </div>
              </div>
            }
          />

        </div>
      </div>
    </div>
  )
}

// Helper Components
function Section({ title, content }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      {content}
    </div>
  )
}

function Step({ number, title, content }) {
  return (
    <div className="flex gap-4">
      <div
        className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex-grow">
        <h4 className="font-semibold text-lg mb-2">{title}</h4>
        <div className="text-gray-700">{content}</div>
      </div>
    </div>
  )
}

function TroubleshootItem({ problem, solution }) {
  return (
    <div className="border-l-4 border-orange-400 bg-orange-50 p-4">
      <h4 className="font-semibold text-orange-800 mb-2">{problem}</h4>
      <div className="text-orange-700">{solution}</div>
    </div>
  )
}

const root = document.createElement('div')
root.id = 'help-root'

document.body.appendChild(root)

createRoot(root).render(<Help />)
