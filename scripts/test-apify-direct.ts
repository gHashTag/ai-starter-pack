#!/usr/bin/env bun

/**
 * 🔍 Direct Apify API Test
 *
 * Прямой тест Apify Google Search API для проверки токена
 * и настройки интеграции
 */

async function testApifyDirect() {
  console.log('🔍 === Direct Apify API Test ===\n');

  const apifyToken = process.env.APIFY_TOKEN;

  if (!apifyToken) {
    console.error('❌ APIFY_TOKEN не найден в переменных окружения');
    console.log('💡 Добавьте APIFY_TOKEN=your_token в .env файл');
    return;
  }

  console.log('✅ APIFY_TOKEN найден');
  console.log(
    `🔑 Token: ${apifyToken.slice(0, 10)}...${apifyToken.slice(-5)}\n`
  );

  try {
    console.log('🚀 Тестируем доступность Apify API...');

    // Сначала проверяем доступность API
    const pingResponse = await fetch('https://api.apify.com/v2/acts', {
      headers: {
        Authorization: `Bearer ${apifyToken}`,
      },
    });

    if (!pingResponse.ok) {
      throw new Error(
        `API недоступен: ${pingResponse.status} ${pingResponse.statusText}`
      );
    }

    console.log('✅ Apify API доступен');

    // Теперь тестируем Google Search actor
    const actorId = 'apify/google-search-results-scraper';
    const testQuery = 'VibeCoding медитативное программирование';

    console.log(`\n🔍 Тестируем поиск: "${testQuery}"`);
    console.log('⏳ Запускаем Google Search actor...');

    const runInput = {
      queries: [testQuery],
      maxPagesPerQuery: 1,
      resultsPerPage: 3,
      languageCode: 'ru',
      countryCode: 'RU',
      includeSnippets: true,
      csvFriendlyOutput: false,
    };

    // Запускаем актор
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(runInput),
      }
    );

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      throw new Error(`Ошибка запуска: ${runResponse.status} ${errorText}`);
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;
    console.log(`✅ Actor запущен, Run ID: ${runId}`);

    // Ожидаем завершения
    console.log('⏳ Ожидаем завершения (максимум 60 секунд)...');
    let attempts = 0;
    const maxAttempts = 30; // 30 * 2 = 60 секунд
    let runStatus = 'RUNNING';

    while (runStatus === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/${actorId}/runs/${runId}`,
        {
          headers: {
            Authorization: `Bearer ${apifyToken}`,
          },
        }
      );

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        runStatus = statusData.data.status;
        console.log(`   📊 Status: ${runStatus} (попытка ${attempts + 1})`);
      }

      attempts++;
    }

    if (runStatus !== 'SUCCEEDED') {
      throw new Error(
        `Run не завершился успешно: ${runStatus} после ${attempts} попыток`
      );
    }

    console.log('✅ Actor завершился успешно!');

    // Получаем результаты
    console.log('📥 Получаем результаты...');
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs/${runId}/dataset/items`,
      {
        headers: {
          Authorization: `Bearer ${apifyToken}`,
        },
      }
    );

    if (!resultsResponse.ok) {
      throw new Error(
        `Ошибка получения результатов: ${resultsResponse.status}`
      );
    }

    const results = await resultsResponse.json();
    console.log(`📊 Получено результатов: ${results.length}`);

    if (results.length > 0) {
      console.log('\n🎯 === Примеры результатов ===');

      results.slice(0, 3).forEach((result: any, index: number) => {
        console.log(`\n${index + 1}. ${result.title || 'Без заголовка'}`);
        console.log(`   🔗 URL: ${result.url || 'Без URL'}`);
        console.log(
          `   📝 Описание: ${(result.description || 'Без описания').slice(0, 100)}...`
        );

        // Проверяем доступные поля
        const fields = Object.keys(result);
        console.log(`   📋 Поля: ${fields.join(', ')}`);
      });

      console.log('\n✅ === Тест Apify API успешно завершен ===');
      console.log(`🎉 Получено ${results.length} результатов поиска`);
      console.log('🚀 Интеграция с VibeCoding Research Agent готова!');
    } else {
      console.log('⚠️ Результаты пустые, но API работает');
    }

    // Информация о потребленных ресурсах
    try {
      const statsResponse = await fetch(
        `https://api.apify.com/v2/acts/${actorId}/runs/${runId}`,
        {
          headers: {
            Authorization: `Bearer ${apifyToken}`,
          },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        const stats = statsData.data.stats;

        console.log('\n📊 === Статистика использования ===');
        console.log(
          `⏱️ Время выполнения: ${stats.runTimeSecs || 'N/A'} секунд`
        );
        console.log(`💰 Compute units: ${stats.computeUnits || 'N/A'}`);
        console.log(
          `📈 Data transfer: ${stats.datasetItems || 'N/A'} элементов`
        );
      }
    } catch (statsError) {
      console.log('⚠️ Не удалось получить статистику использования');
    }
  } catch (error) {
    console.error(
      '❌ Ошибка тестирования Apify API:',
      error instanceof Error ? error.message : error
    );

    if (error instanceof Error && error.message.includes('401')) {
      console.log('\n💡 Возможные причины ошибки 401:');
      console.log('   • Неверный APIFY_TOKEN');
      console.log('   • Токен истек');
      console.log('   • Нет доступа к Google Search actor');
    }

    if (error instanceof Error && error.message.includes('402')) {
      console.log('\n💡 Ошибка 402 - недостаточно средств на аккаунте Apify');
    }
  }
}

console.log('🕉️ VibeCoding x Apify Integration Test\n');
testApifyDirect().catch(console.error);
