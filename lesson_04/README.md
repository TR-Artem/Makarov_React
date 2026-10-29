# Домашнее задание № 4 · План запроса и индексы

**Студент:** Гаврик Артём Олегович, группа РПО23/1

Практикум: <https://maximbytecamp.github.io/mongodb_theory_makarov/praktiki/onlayn-razbor-zaprosa/index.html>

База `logs`, коллекция `events` — 1200 событий журнала (выгрузка
`stend/seed/logs.events.json` из репозитория практик), сервер MongoDB 7.
Планы сняты командой `.explain("executionStats")` в `mongosh`; индексы
между замерами возвращались к исходному виду — только `_id_`.

## Сводная таблица

| Файл | Задание | Индекс | `nReturned` | `totalDocsExamined` | `totalKeysExamined` | Шаги плана |
|---|---|---|---|---|---|---|
| `plan-1.json` | 1 | нет | 33 | 1200 | 0 | COLLSCAN → SORT |
| `plan-2.json` | 2 | `{ service: 1, level: 1, ts: -1, duration_ms: 1 }` | 33 | 33 | 43 | IXSCAN → FETCH |
| `plan-3a.json` | 3, вариант А | `{ duration_ms: 1, service: 1, level: 1, ts: -1 }` | 33 | 33 | 378 | IXSCAN → SORT → FETCH |
| `plan-3b.json` | 3, вариант Б | `{ service: 1, level: 1, duration_ms: 1, ts: -1 }` | 33 | 33 | 33 | IXSCAN → SORT → FETCH |
| `plan-4-bez.json` | 4, до индекса | нет | 10 | 1200 | 0 | COLLSCAN → SORT |
| `plan-4.json` | 4, с индексом | `{ level: 1, duration_ms: -1 }` | 10 | 10 | 10 | IXSCAN → FETCH → LIMIT |

В столбце «Шаги плана» порядок сверху вниз — от первого шага к корню плана,
так же, как визуализатор рисует дерево: `COLLSCAN → SORT` значит, что
коллекцию прочитали целиком, а потом отсортировали.

## Ссылки на разбор в визуализаторе

Ссылки открывают те же планы на
<https://dfrancour.dev/tools/mongodb-paste-the-plan> без загрузки файлов:

- `plan-1.json` — запрос 1 без индекса: <https://dfrancour.dev/tools/mongodb-paste-the-plan#v1:zVXbbts4EP0Xoo_ewIrj2PFb4tjboHGdRmmLRbFYjMWRwoYiVZJy7Bj-985Q8SW9JEUXWOyT5Zk5czlzSK4ELioNynxA55U1YiAS0RJfanTLKw3GoBODlTBQoq8gQ_JrW_gDnKMJniKVkbgYKx3QpRjEIAftsSUqcB7lO07D-FdgpBh8WglNQB0t-IVyoXPWifW6tRIe3VxxgY2vgmUZi0S3rB0EavCf0seQgmp12-31-u_1Y7uvwd8SbHiWHHVH_XPqjQYzQ8hu8Q0un3psFVSpHmLGG1XiRGmtKHG7JUpYXPBMKKcutbrmEH-NnEZux9sFnRr5XFSagfE3dkQkW4nfBtwrY5QpmGgeygcomOF0en1DTXrrwhUEYjZ6iYnBHwlNW2J5Sd0TAUn7qN_tHbep7bCsGOpVWWmMe6nqkDYJd5mH08vLdHj6lgLyuLP_YDlSOcxCo63cuntwklHC4Weyo-TpCfaJY4nRLHJJnYeYa2epsww92YKriTpzjaF2hsnsdPaA32wz2ACa1u9HCyhVDN9Yz222Z00OmcX9-gX6Hyzl5bojT9qCgLHSvXV3nrN3ui0Bcg4m20ANomRUrJ00__9SqJsWPcyRSWA3c-WDdXsGKjMdx69_pZKGCAiQqgdMKRM3d5L0KW9N5_dc-butWH1F4zWsxk9yM5D6IoIYH13_H9397qZ4Fz_dVHLc--1N_eggkPU7Ga75dGS2LCM_K2KMf8X2yt0xuKVnx0trw-Yjja2fk9Ro54loXsnZ4w0v2E3p0V2Y3HLQrfUhOjPQ8Zsu2Ig_7LUTYmW-fUF6B-2Doy75CxV27wp0DztJB5MOzLrd7GQmZd7LOnl-kkiYHfaPc-j0k97J8a7yFTh6d2jW2LgyrHHQ8VEZ01sUzuo8p2eHpHe2DHxa95T-ffQEFtM6kDrp4D-PubT2rq6iiC_YVKJUtE7C1UwyJXoevwlMbe0y_NPZuiLMBEvrli90SnFnxPAdvQp8HBvMe0-dvAC8cvZWzVTYoCfoCpyaiTWFTR9P5tM6p1LeWHqzf3UOCv1ISrT3Y5a-_9WJxrxDPlxDa4KzuhF_hkMN3qtsZApSPu_c0lWTrL8C>
- `plan-2.json` — запрос 1 с индексом по ESR: <https://dfrancour.dev/tools/mongodb-paste-the-plan#v1:7VZLcxo5EP4rLlUOOUxcjDHG5mYwJK5dgjeQ7G4RFyVGPaCgkSaSBkMo_vt2a3jvrp1jUpWTZrr7a_Xja0krBotccak_gXXSaNZgMYvY1wLs8kFxrcGyxoppnoHLeQKoV2bizmEO2ju0lFrAoiOVB9sHzxopVw4ilnPrQPxBbgj_imvBGsMVUwhUQQJf0RdYayxbr6MVc2DnkjbY6nK-zMImQS0Kyz0GOMpcMJngXrVKZb1-XG_CfcfdFGGtZnxZa1_fYWyYmG7xZAq_AUbB7jrNOI7bTdSY3MtMfgseBzKDrlRKouNKxDK-uKecQPRs36iCTNwHIDdil97e6FaL56z6CdduYNpYZCPg1OBJai31hApNSTnPJ1ThTnvQehdqmxe-Xwr32vu_-q3b96iewfKBeyx8Cd7WL462VcYvLF_jDa5H5YvXm769x7aixw10FI8CEFfvRm_i0QFoRKyQrlsoL0M1tyluBBjI1B2FMXzcxUGfFAitR4EMqXnSfdQSO7jzKV0_0OdA8MCtl1ztJRT9jrIX6FZaSHxJ4NTYJ27FlpxNU2hxEhsbft7x6zOLzg7_HtlB5GQYSFpabT6DSciIDbt8gflHZ12pcQ2a4xzZa-RpdCZ1el5B9RrpzCx8wXBBUOe3dUA2JYFH2HEf4t1LiiQBhzJvC8xefwBfWE1EqlYPgCdM9sZzhTG59oJnMphfVjfiO5MciI-8BMK5_-Ljy_u2Hc4V9xD2fzJ25so9uZhznWyBGkAQhjVuyp-_JSgRMI7PgfIvPVhw3tgDAe7Q6wRii38lwJUFLugY6I2_lNbPz8-PlM6vWf4pZzk07mS-HADxJK4QOHcDbDqUbKDfO2vyPPyHgyAxWRbuxhVLJa1sd7Om4VI9ynV_J-6y2lyh0f9fkBiRsZ5kJYFQ8EqMNxc5IzW6B3uvU0NGU-N8UCZchW-8RwP-ol6J6xGb7x4K9fPK-WUN9RPp988HXruoxlWIq3xcqyU3YyHSelJN05tY8PHF9VXKq9dx_eZqvzMSArmLuYbApaYp4Cq8HTr45PDNIk3xdSG_QXPpIZT28rpWv6qEET-1xh72Co-Dj0fc85jfjZkVeTgf7kmUgZA4mYgrqMjo6Hn81rBvCpvAW2uKHDFdyIxdvhAp2jWxwjO8_PtY3BLz0WEkLwAfrJnKsfRbdBfsBHq6a_TE9DeH3vE-t0IMDD7NvjcPNP0TmWieOnSKue_NqEM9pCOyZbS3RpWzm0BLcedk0tYTnBDquZnRofUP>
- `plan-3a.json` — запрос 1, вариант А: <https://dfrancour.dev/tools/mongodb-paste-the-plan#v1:7VZZb9s4EP4rAdGHfVADKz7jt_jaBlvXaeTugTQIaHFks5ZIlaQcu4b_-w6pw3bSOEX3ZRfYvJiai998nJnMlsA6jSkXv4PSXArSJT7xyNcM1OYmpkKAIt0tETQBndIQUB_LuT6HFQij0ZILBusRjw2oAAzpRjTW4JGUKg3sow1j_d9QwUj3bktidIydBL5iLFBKKrLbeVuiQa24vaDUpXSTuEucmmWKGgT4kGhnMse7mrXabne_K-C-o3qBbv2e32gOOwPEhomJPg0X8BsgCjIY9XzfH_ZQI1PDE_7NRZzyBMY8jjkGrnkkoetrmxOwiQpknFkTfQs2DKvS2xtdCXbKKgip0FM5RJIlg6cGj1wILuaWaJuUNnRuGR4Np_13jts0M0Eu3GuDye0UlVoqc0MN8u58kafuWx-5SCB5j7khPX6t0Wm2WzVMymxS68ogollsXgx9_WfQv_qA6iVsDmIfce97-6fCc_GgeKoQuJL4gBVjb9y7PvgPhSOenBv-Gv3w1hYc12MExt1DlewVAgSy0M9g3N0f4LAfBRB7NE5vkehPgmNxVDG5DlxlHghuqDKcxnuJRV91w4VHGFcQmrw3IqkeqWJl3fdkJth3sJFfsDS9My6i89o9OUJK7j5Xlf2ZeGeHX860zMMauvbIrYqjM3H5kbsxXSM93tmYC_xFzQ7_PKLgC-IFZquqJAIrNXQ1ik9uHOC9JAtD0CgzKsP0xS2YTAlbpPX6geOTLjHS0Bhv1cM1TXhu3u4U8oEMD-X14_vnoL9X7K9fPNTYtNSAA_Ao1RLjNHy0pWxFRVh6CgBmnSyiy_zzLw4xc26arsBykAdRoI1UBwK8ZDJy1cye5UBjBZTZMTOZfcmtT_XnvyyffzYu8melhgb8GwQYyoHzW_jiGc75AdfLqoF0itnlVeKOqLaOCAz5sf4nuKsG0M-x5wh6kb1G86fZ-38e_ifnoXu4pyNKA7haabQwlyzVU3x2yOvBfg6UTFP3nY_TUCaJ2162JOL2l1S7T-TWHle_ZT77raVCXiw53ssrTN6dR235hs2KVYvscrpAXYtIWqOF1MYpQxq7M246zv-iXfPbHllVq1z7vHbeaKJ-zs1-waPNi7pfB79OZ81meDljLGqH9Si69BmdXXRaEa13_PZla38z1gSWL-bqgHNhG4HGbrsb4VJoelkU4f6Hvd3bGDveD2bJc2t8p0lmsP3x_8Rpn_dSLrPUTYlrK0qAcWxO9MssyRjotH9pGMhMhfCrklmKPmNIpNq8ghTtesjwEtczO-9yn08akbzieKPkgs-4Kb3HoOYwEWMp5jIoRt_xPVeMTSUuzz-aB5r-gZUoH0d2kOkfzWhk39AOyr4URsk4b98Q-jHVmodDMccmsW8ucZb7u78B>
- `plan-3b.json` — запрос 1, вариант Б: <https://dfrancour.dev/tools/mongodb-paste-the-plan#v1:7VZLcxo5EP4rLlUOe5i4ZowxmJt5bVwbgtdD9lGOyyVGPaCgkSaSBkMo_vu2NDA8ssap7GW3armM1N1fq9_0isAiF5TL30AbriRpkYgE5EsBenknqJSgSWtFJM3A5DQB5As1MecwB2kNSnLJYNHnwoKOwZJWSoWBgORUG2C_OjUO_4ZKRloPKyIQKDwFvqAu0Fppsl4HK2JAz7l7YMvL6TLzj3g2KzS1aOBTZrzIBN-qh-F6_bjemPuOminCOu3ost5rdtE2dEx2aDKFXwCtIN1-O4qiXhs5Krc841-9xhHPYMCF4Kg4DEhGF7fOJ2BDHStROBFzD04Nq9zbCd1IdkoqTqg0I9XDICsGxwLPXEouJy7Qzilj6cRFuN8bdd752OaFjUvijhsP70fINErbO2ox7h6LcWq9jTAWGWTv0TcMTxReNuuNqxCdssvcQRmktBD2RdW3f8Sdmw_InsFyT3eVmijYJhBPBxnBe2WBL4kPWDGocQN9ip48EL97MLxZ8_TWFRw3AzSM-0Rto7choCFTc2DGw2NlhzseGOII1n-dJeaj5FgclU5uYl-Ze4Q7qi2nYkdx1lfdcIHquYbElr2RKv1MNdvWfVsVkh3ZRh4-VaX7iQRn-7dHsme5E_T1X0ptjl7k0CPyExZ6cMZleh56tvePPAzoAsMTnA24xC9y1vgLiIbPaC8wV1XbQGClJr5GMeXWG7yjFEkCBmlWF-i-vAdbaOmKtFbbAx51iVWWCnzV9BY045W4J3dVckTef34C5u9q_fV3ewZ7llrw7z8rPUM9V82AUDanMtkCJQBzGLxdlrc_OQjmQYbOwQWgVKHBWKX3CPjEsF-W9jceUKGBMjdjhuPPpfSp5vxXefPPJkWZUmppzL9CjKq8bZGztcAR3-VmVvWOydG3skD8EdkOiIZhdBz-ROSq2fNjsXPxeSl24Q-H7v85-J-cgz5xRx1sAGZmk7DcjDDnUBaDu3a1ynN_L2doorLMrywrknL3JdXCk_pd58DX3apSebXZbIKX95ayLw8a8g0bb_Yr4tioHvStTJUTmipjPTOhwp9xvfH4i0YYNQIyr_a3xnl4fllH_oTb3VZH6xe1qAZRjY7r9eR6zFjaSGppeh0xOr5oXqW01owa11e7l7EgsHbRV284l64LqPArXR83Qdsu0hSXPuzq9tK6ob43Rb6VxiQNC4uNj_8OpzHvlZoVuZ8Pt46UAePYmYgrXJBR0Wn8VjBWhU7gZ62KHDEDyJRevmIpyrUxwjPcydykKzEfDVryCvBOqykfc7tFD0BPYCgHSk5UvBl6h-_cMDZSuDF_rx8o-jtWonruuylmvtejvsuhG5EdJa1WouzdBDqCGsOTnpxgh7icK5zi0fov>
- `plan-4-bez.json` — запрос 2 без индекса: <https://dfrancour.dev/tools/mongodb-paste-the-plan#v1:tVVbb9owFP4vVh9ZlYRSaN9aCls1GKxhm6Zpmkx8Qr06dmY7FFrx33eOUy69qO2m7Qlzrt_5ziW3DBal4lJ_Buuk0eyYxazBflVgl2PFtQbLjm-Z5gW4kmeAemVmbh_moL1DS6kFLPpSebApeHacc-WgwUpuHYiPFIb8FdoreuzBLwwB1hrLVqu7RO-4u0Rpq5ccNg9aPYyKkHSXZ5fwHpb3Nab0spA33CPYiSxgKJWSjh1HDVbwxTmhATGyqVEVmbgLoDBiA2xrdKLFc1ZpxrWbmB7SYwQ8NLiWWks9I4qoLOf5jLhJRxcTBOmM9WPukZOgFZUNeH8UCPRNjGUXUAywDOQrjg46rfZhhPgVSU4KU-kgbzC_LCmok0WpIHBdVj6tU21zdkeDQdo9-YAGeejDs4QLaSHzdadzY6-5FUFu4SfKQVBFiPLbd5QhS1ngB3NiszHaVlJlGTiUeVshHfoCfGU1EUTAN2YPOuSN5wpb6noLXshgvpaemWxHGidRdD__DNwTRL-ct-dwXriHkOna2CtH0eOkwbiYc52tXTWAIK-QO67_f5WgaoiOz4FIIDVx5byxOwJMM-qH13_qfE0R9zyVN5BiDoKddJJmg1W4Z2fSXW1G05VYeM13eKKaHBExUkf-QfUvZmmX_c6f0E8E79Dfuc9_lER_zf9T443SR8O1IvyZKQquBZWWS_plm7P2qPp12XWLn-6tWje2wfbE9O5UBhewc7DnOjfkeGmcD8qMq_DGexdiJu0objfYfHOK2_vR_kEL9TPptweat5Jm3IS4yaetVnY0FSJvZ808P4oFnyadw5w3O3H76HCbecwtHnAsKOyQ1DSeXIXr3Mej7k-rPMf7jbNxuvS0aDuz-dh6yBejyuP44M4-7zMw5qoqw5Sdk6gAIbFn6FcVSDQGet5_bZiaymbw1pqqRJ8hFMYuX0CKdqfI8BUeadqX2ueTQyQvOI6tuZRT6dfeQ7AzGOmh0TOT3q3O_TwnQkwMfvxeWweafsFxM9d9mm_32or61ENaoa7R3hpVT3gGXcWdk1lPz3C8qecGb0G8-g0>
- `plan-4.json` — запрос 2 с индексом: <https://dfrancour.dev/tools/mongodb-paste-the-plan#v1:7VZLc9owEP4rHU2PNIMhQJJbINAyLSWN6WvSTEZYa1CRJVeSCWmH_95dmVdJm_R16KEn26tvX9_uav2FwSJXXOo3YJ00mp2wiFXYpwLs7bniWoNlJ1-Y5hm4nCeA58pM3AHMQXuHSKkFLHpSebAxeHaScuWgwnJuHYhXZIb0FeIVvTyGT2gCrDWWLZcrR8-4m6K00a0164eNLlrFkHSHJ1N4DqjP2vXuWfuoeYYnJvcyk5-5x2BHMoOBVEo6dlKtsIwv-hQNiKGNjSoI4i6AzIhNYFvQqRb3oeKEazcyXaTHCNgH3EitpZ4QRZSW83xC3LzoD_ojjFJhjP40M4VGSqIq0ZQXPi5RW3ivO-o8Yz867b-LO6cv8XgGt-fcI8N6h8uowkRhAw_XGRLwJFquqvESi0V1Itx1dL2Dun5CxZVuUCgvA7XrfFcCdDN1O04ur_a8XF6RF_daS6zcRl26OBR8R3DOrZdcbSUU2abJamhWWkh82XKpsTfcinU7tZE38U0Y7PJD2TQfWOXR5vWK3QmPXQ74AhOpPBpIjU-ELJfUaBY-ojsQVLF1HtgFSag_Uu-Dv62kSBJwKPO2wOj1BfjCamoAquYGtteB3niu0KvrLngmN_AgPjPJnnjX_QTc9_roYb9dh_PAPQT_N8bO0E6EvcHFnOtkragBBOkEFH28l6BE-HJ8DpR_eWbBeWN3BOhh2Avd9os9_ZuhV_966Pgm7nDPlQUu6OYZjj-W6Ptn8F9K5_998Ef3QSBwrx8cQKgX6eduhNxDWRT6PLMmz8N3eZckJsu4FhRQKunJNuswDZtwJ9T1rkMXxno6uFulMFllHI_FeLVigwrYOdi-Tg0pTo3z4TDhKrzjngw2a61q1Kqw-WaFtw6qB4cNPJ9Iv13svFGrR3WI6nzcaCTHYyHSVlJP0-NI8HHtqJny-lHUOm5uPWPRsHcwoUC-1NRyXIWt3sOfAd8u0hT3vvwM7VsPod8PjxqtZjXM0z4aKzEsPE4ZXoX367wwZlbkYRj7JMpASBwD1CsyJBoN3a-_BsamsAk8tabIUWcAmbG3D0SKuDYyPMPlHiO5pc5rh5E8oHhuzVSOpV9rD8BOYKgHRk9MvLphvvVzKsTI4E_Tz-aB0LfYbuamR1eG-9mMelRDuo86RntrVDlfCXQUd04mXT3BMaCamxkaWX4F>

## Задача 1. Запрос без индекса

```javascript
db.events.find({
  service: "payments",
  level: "error",
  duration_ms: { $gt: 500 }
}).sort({ ts: -1 })
```

`plan-1.json`: `nReturned` 33, `totalDocsExamined` 1200,
`totalKeysExamined` 0, шаги `COLLSCAN → SORT`.

Индексов, кроме `_id_`, нет. Сервер перебирает всю коллекцию: 1200
документов прочитано, после фильтра остаётся 33. Порядок в коллекции не
совпадает с `ts`, поэтому нужна блокирующая сортировка `SORT`: в память
складываются 33 подходящих документа (`totalDataSizeSorted` порядка
9 КБ). Читаем в 36 раз больше, чем возвращаем; на 1200 записях это
незаметно (`executionTimeMillis` 0), на реальном журнале это COLLSCAN на
миллионах документов.

## Задача 2. Индекс по правилу ESR

Правило ESR: Equality, Sort, Range — в индексе сначала поля равенства,
потом поле сортировки, в конце диапазон.

| Часть ESR | Поля запроса |
|---|---|
| Equality | `service: "payments"`, `level: "error"` |
| Sort | `ts: -1` |
| Range | `duration_ms: { $gt: 500 }` |

```javascript
db.events.createIndex({ service: 1, level: 1, ts: -1, duration_ms: 1 })
```

`plan-2.json`: `nReturned` 33, `totalDocsExamined` 33,
`totalKeysExamined` 43, шаги `IXSCAN → FETCH`, шаг `SORT` пропал.

Что изменилось:

- 1200 → 33 прочитанных документа: читаются только документы, которые
  вернутся;
- блокирующей сортировки нет — `ts` идёт в индексе сразу после полей
  равенства, и участок индекса уже упорядочен по `ts` по убыванию;
- просмотрено 43 ключа: участок «service=payments, level=error» содержит
  все ошибки платежей, среди них 10 с `duration_ms <= 500` отсеялись по
  диапазону, 33 остались.

## Задача 3. Порядок полей

Вариант А — `{ duration_ms: 1, service: 1, level: 1, ts: -1 }`
(`plan-3a.json`): `nReturned` 33, `totalDocsExamined` 33,
`totalKeysExamined` 378, шаги `IXSCAN → SORT → FETCH`.

Вариант Б — `{ service: 1, level: 1, duration_ms: 1, ts: -1 }`
(`plan-3b.json`): `nReturned` 33, `totalDocsExamined` 33,
`totalKeysExamined` 33, шаги `IXSCAN → SORT → FETCH`.

| | A: `duration_ms` первым | Б: `service, level` первыми |
|---|---|---|
| Ключей просмотрено | 378 | 33 |
| Документов прочитано | 33 | 33 |
| `SORT` в плане | есть | есть |
| Найденный участок индекса | весь диапазон `duration_ms > 500` | участок равенств для `payments/error` |

В обоих вариантах один документ из индекса читается ровно один раз, но
вариант А просматривает в 11 раз больше ключей (378 против 33).

Причина в том, как сервер использует индекс. Поиск по индексу — это поиск
непрерывного участка между двумя границами: ограничения на хвост после
границы проверяются уже по каждому ключу. В варианте А первым стоит поле
с диапазоном, поэтому сервер может провести границу только по
`duration_ms > 500`; условие `service`/`level` он проверяет уже на каждом
найденном ключе. Таких ключей 378, подошло 33 — отсюда лишние 345.
В варианте Б сначала идут равенства: они задают точный участок из 33
ключей, а `duration_ms` проверяется внутри него.

Сортировка в обоих вариантах отдельным шагом `SORT`: поле `ts` стоит в
индексе последним, после поля с диапазоном, и порядок ключей `IXSCAN` по
`ts` не гарантирован. Индекс по ESR (`plan-2.json`) от этой сортировки
избавляет именно потому, что `ts` идёт после равенств и до диапазона.

Порядок двух равенственных полей между собой (`service` и `level`)
результата по числу ключей не меняет — они оба точные и задают
компактный участок; на выборку это не влияет, важнее сам принцип ESR:
равенства, потом сортировка, потом диапазон.

## Задача 4. Индекс для второго запроса

```javascript
db.events.find({ level: "error" }).sort({ duration_ms: -1 }).limit(10)
```

| | без индекса | `{ level: 1, duration_ms: -1 }` |
|---|---|---|
| Файл | `plan-4-bez.json` | `plan-4.json` |
| `nReturned` | 10 | 10 |
| `totalDocsExamined` | 1200 | 10 |
| `totalKeysExamined` | 0 | 10 |
| Шаги | `COLLSCAN → SORT` | `IXSCAN → FETCH → LIMIT` |

`level: "error"` — равенство, `duration_ms: -1` — сортировка. По ESR
нужен индекс `{ level: 1, duration_ms: -1 }`: равенство впереди,
сортировочное поле вторым и с тем же направлением, что в запросе.

Почему не другие варианты:

- `{ level: 1, duration_ms: 1 }` — направление сортировки другое: индекс
  можно читать только в обратную сторону целиком, но вместе с равенством
  MongoDB сортировку по такому индексу обслужить не смогла бы и вернула
  бы `SORT`;
- `{ duration_ms: -1 }` — индекс упорядочен по длительности всех
  событий: для каждой ошибки сервер шёл бы по индексу и отбрасывал
  не-ошибки, пока не наберёт 10;
- `{ duration_ms: -1, level: 1 }` — та же ошибка порядка, что в задаче 3:
  равенство стоит после сортировочного поля.

С правильным индексом `LIMIT` выходит сразу после `FETCH`: сервер
отдаёт первые 10 ключей участка `level: "error"` с уже нужным порядком,
поэтому и ключей, и документов просмотрено ровно 10.

## Как переснять планы

```bash
docker compose up -d
docker compose run --rm reset
docker compose exec -T mongosh --quiet logs --eval 'db.events.getIndexes()'
```

В `plan.py` меняются `FILTR`, `SORTIROVKA`, `PREDEL` и `FAYL`, запуск —
`docker compose run --rm python work/praktikum-explain/plan.py plan-N.json`.

Порядок съёмки: `plan-1.json` без индекса → создать
`{ service: 1, level: 1, ts: -1, duration_ms: 1 }` → `plan-2.json` →
удалить (`db.events.dropIndex(...)`) → создать `{ duration_ms: 1, service: 1, level: 1, ts: -1 }` → `plan-3a.json` →
удалить → `{ service: 1, level: 1, duration_ms: 1, ts: -1 }` → `plan-3b.json` →
удалить → `plan-4-bez.json` без индекса → `{ level: 1, duration_ms: -1 }` →
`plan-4.json`. Перед каждой съёмкой — `db.events.getIndexes()`, чтобы не
остался индекс от предыдущей задачи.
