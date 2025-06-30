#!/usr/bin/env bun

/**
 * 🔍 Apify Actors Discovery
 *
 * Ищем доступные акторы для Google Search в Apify
 */

async function checkApifyActors() {
  console.log('🔍 === Поиск доступных Apify акторов ===\n');

  const apifyToken = process.env.APIFY_TOKEN;

  if (!apifyToken) {
    console.error('❌ APIFY_TOKEN не найден');
    return;
  }

  console.log('✅ APIFY_TOKEN найден\n');

  try {
    // Список популярных Google Search акторов для проверки
    const actorsToCheck = [
      'apify/google-search-results-scraper',
      'lukaskrivka/google-search-results',
      'drobnikj/google-search-results-scraper',
      'apify/google-search',
      'apify/web-scraper',
      'lukaskrivka/google-search',
      'dtrungtin/google-search-console',
    ];

    console.log('🔍 Проверяем доступность акторов...\n');

    for (const actorId of actorsToCheck) {
      try {
        console.log(`📊 Проверяем: ${actorId}`);

        const response = await fetch(
          `https://api.apify.com/v2/acts/${actorId}`,
          {
            headers: {
              Authorization: `Bearer ${apifyToken}`,
            },
          }
        );

        if (response.ok) {
          const actorData = await response.json();
          console.log(`   ✅ Доступен: ${actorData.data.name}`);
          console.log(
            `   📝 Описание: ${actorData.data.description?.slice(0, 100)}...`
          );
          console.log(
            `   🏷️ Теги: ${actorData.data.taggedBuilds?.[0]?.tag || 'N/A'}\n`
          );
        } else if (response.status === 404) {
          console.log(`   ❌ Не найден (404)\n`);
        } else {
          console.log(
            `   ⚠️ Ошибка ${response.status}: ${response.statusText}\n`
          );
        }
      } catch (error) {
        console.log(
          `   💥 Ошибка: ${error instanceof Error ? error.message : error}\n`
        );
      }

      // Небольшая пауза между запросами
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Также попробуем поискать через Apify Store API
    console.log('🏪 Ищем в Apify Store...\n');

    try {
      const storeResponse = await fetch(
        'https://api.apify.com/v2/acts?limit=50&search=google%20search',
        {
          headers: {
            Authorization: `Bearer ${apifyToken}`,
          },
        }
      );

      if (storeResponse.ok) {
        const storeData = await storeResponse.json();
        const googleActors = storeData.data.items.filter(
          (actor: any) =>
            actor.name.toLowerCase().includes('google') ||
            actor.name.toLowerCase().includes('search')
        );

        console.log(`🎯 Найдено ${googleActors.length} акторов с поиском:`);

        googleActors.slice(0, 5).forEach((actor: any) => {
          console.log(`   📦 ${actor.id}`);
          console.log(`      ${actor.name}`);
          console.log(`      ${actor.description?.slice(0, 80)}...`);
          console.log(`      👤 ${actor.username}/${actor.name}\n`);
        });
      }
    } catch (storeError) {
      console.log('⚠️ Не удалось получить данные из Store');
    }
  } catch (error) {
    console.error(
      '❌ Общая ошибка:',
      error instanceof Error ? error.message : error
    );
  }
}

checkApifyActors().catch(console.error);
