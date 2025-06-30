#!/usr/bin/env bun

/**
 * 🔍 Apify Web Scraper Test
 *
 * Тестируем альтернативный подход через Web Scraper
 * для получения данных из поиска Google
 */

async function testWebScraper() {
  console.log('🔍 === Apify Web Scraper Test ===\n');

  const apifyToken = process.env.APIFY_TOKEN;

  if (!apifyToken) {
    console.error('❌ APIFY_TOKEN не найден');
    return;
  }

  console.log('✅ APIFY_TOKEN найден\n');

  try {
    // Сначала проверим, какие акторы вообще доступны
    console.log('🏪 Проверяем доступные акторы...');

    const actorsResponse = await fetch(
      'https://api.apify.com/v2/acts?limit=20',
      {
        headers: {
          Authorization: `Bearer ${apifyToken}`,
        },
      }
    );

    if (!actorsResponse.ok) {
      throw new Error(
        `Ошибка получения акторов: ${actorsResponse.status} ${actorsResponse.statusText}`
      );
    }

    const actorsData = await actorsResponse.json();
    console.log(`📊 Найдено акторов: ${actorsData.data.items.length}`);

    if (actorsData.data.items.length > 0) {
      console.log('\n🎯 Первые 5 доступных акторов:');

      actorsData.data.items.slice(0, 5).forEach((actor: any, index: number) => {
        console.log(`   ${index + 1}. ${actor.id}`);
        console.log(`      📝 ${actor.name}`);
        console.log(`      🏷️ ${actor.description?.slice(0, 60)}...`);
      });

      // Ищем подходящий актор для веб-скрапинга
      const webScrapers = actorsData.data.items.filter(
        (actor: any) =>
          actor.name.toLowerCase().includes('web') ||
          actor.name.toLowerCase().includes('scraper') ||
          actor.name.toLowerCase().includes('search') ||
          actor.name.toLowerCase().includes('google')
      );

      if (webScrapers.length > 0) {
        console.log(`\n🎯 Найдены веб-скраперы (${webScrapers.length}):`);

        webScrapers.forEach((scraper: any) => {
          console.log(`   📦 ${scraper.id}`);
          console.log(`      ${scraper.name}`);
        });

        // Попробуем использовать первый найденный скрапер
        const selectedScraper = webScrapers[0];
        console.log(`\n🚀 Тестируем: ${selectedScraper.id}`);

        await testActorRun(selectedScraper.id, apifyToken);
      } else {
        console.log('\n⚠️ Веб-скраперы не найдены среди доступных акторов');

        // Попробуем просто с первым доступным актором
        if (actorsData.data.items.length > 0) {
          const firstActor = actorsData.data.items[0];
          console.log(`\n🧪 Пробуем с первым доступным: ${firstActor.id}`);
          await testActorRun(firstActor.id, apifyToken);
        }
      }
    } else {
      console.log('⚠️ Нет доступных акторов');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error instanceof Error ? error.message : error);
  }
}

async function testActorRun(actorId: string, token: string) {
  try {
    console.log(`\n⏳ Запускаем актор: ${actorId}`);

    // Простой тестовый input
    const runInput = {
      startUrls: ['https://example.com'],
      maxRequestsPerCrawl: 1,
    };

    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(runInput),
      }
    );

    if (runResponse.ok) {
      const runData = await runResponse.json();
      const runId = runData.data.id;
      console.log(`✅ Актор запущен, Run ID: ${runId}`);

      // Ждем немного и проверяем статус
      await new Promise(resolve => setTimeout(resolve, 5000));

      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/${actorId}/runs/${runId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log(`📊 Статус: ${statusData.data.status}`);

        if (statusData.data.status === 'SUCCEEDED') {
          console.log('🎉 Актор успешно выполнился!');
        } else if (statusData.data.status === 'RUNNING') {
          console.log('⏳ Актор еще выполняется...');
        } else {
          console.log(`⚠️ Неожиданный статус: ${statusData.data.status}`);
        }
      }
    } else {
      const errorText = await runResponse.text();
      console.log(`❌ Ошибка запуска: ${runResponse.status} ${errorText}`);
    }
  } catch (error) {
    console.log(
      `💥 Ошибка тестирования актора: ${error instanceof Error ? error.message : error}`
    );
  }
}

console.log('🕉️ VibeCoding x Apify Web Scraper Test\n');
testWebScraper().catch(console.error);
