import { test, expect } from '@playwright/test';

test('top page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '公立高校マッチングシステム' })).toBeVisible();
});

test('students page', async ({ page }) => {
  await page.goto('/students');
  await expect(page.getByRole('heading', { name: '学生一覧', level: 1 })).toBeVisible();
});

test('schools page', async ({ page }) => {
  await page.goto('/schools');
  await expect(page.getByRole('heading', { name: '高校一覧', level: 1 })).toBeVisible();
});

test('admin page', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: '教育委員会向けページ' })).toBeVisible();
});

test('detail pages', async ({ page }) => {
  await page.goto('/students/1');
  await expect(page.getByRole('heading', { name: '学生詳細' })).toBeVisible();

  await page.goto('/schools/1');
  await expect(page.getByRole('heading', { name: '高校詳細' })).toBeVisible();

  await page.goto('/admin/sessions/1');
  await expect(page.getByRole('heading', { name: '選考セッション詳細' })).toBeVisible();
});
