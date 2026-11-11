import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  palette,
  typography,
  radii,
  spacing,
  shadows,
} from '@/core/theme';
import {
  Button,
  Card,
  Input,
  Badge,
  ScreenContainer,
} from '@/presentation/components/common';
import {
  useAuthStore,
  useTripStore,
  useExpenseStore,
  useSocialStore,
} from '@/presentation/stores';
import { ExpenseCategory } from '@/domain/entities/expense';
import { TravelPost } from '@/domain/entities/post';

type TabView = 'overview' | 'auth' | 'explore' | 'destination' | 'trip' | 'planner' | 'feed' | 'createPost' | 'expense' | 'scanner' | 'expenseReview' | 'profile';

const destinations = [
  { id: 'danang', title: 'Da Nang', subtitle: 'Coastal city escapes', region: 'Central Vietnam', category: 'BEACHES', rating: 4.9, budget: 850000, image: 'photo-1559592413-7cec4d0cae2b', about: 'Bãi biển dài, bán đảo Sơn Trà và ẩm thực miền Trung tạo nên điểm dừng chân phù hợp cho chuyến đi cùng bạn bè.' },
  { id: 'dalat', title: 'Da Lat', subtitle: 'Pine hills & slow mornings', region: 'Central Highlands', category: 'MOUNTAINS', rating: 4.8, budget: 700000, image: 'photo-1519681393784-d120267933ba', about: 'Khí hậu mát, đồi thông và quán cà phê nhỏ cho một chuyến đi thư thả giữa cao nguyên.' },
  { id: 'hoian', title: 'Hoi An', subtitle: 'Lantern-lit heritage', region: 'Quang Nam', category: 'HERITAGE', rating: 4.9, budget: 650000, image: 'photo-1533105079780-92b9be482077', about: 'Phố cổ, đèn lồng và những trải nghiệm ven sông tạo nên lịch trình giàu văn hóa.' },
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [category, setCategory] = useState('ALL');
  const [query, setQuery] = useState('');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('danang');
  const [tripDays, setTripDays] = useState('3');
  const [tripBudget, setTripBudget] = useState('3000000');
  const [preferences, setPreferences] = useState('Ẩm thực địa phương, biển và trải nghiệm văn hóa');
  const [plannerError, setPlannerError] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [postDestination, setPostDestination] = useState('Hoi An Ancient Town');
  const [receiptMerchant, setReceiptMerchant] = useState('Cộng Cà Phê');
  const [receiptAmount, setReceiptAmount] = useState('185000');
  const [receiptCategory, setReceiptCategory] = useState<ExpenseCategory>('FOOD');
  const [receiptMembers, setReceiptMembers] = useState<string[]>(['Việt', 'Tú']);

  const { user } = useAuthStore();
  const { activeTrip, selectedDayIndex, setSelectedDayIndex, updateTrip, generateItinerary, isLoading } = useTripStore();
  const { expenses, totalBudget, totalSpent, addExpense } = useExpenseStore();
  const { posts, addPost, likePost } = useSocialStore();
  const selectedDestination = destinations.find((destination) => destination.id === selectedDestinationId) ?? destinations[0];
  const visibleDestinations = useMemo(() => destinations.filter((destination) =>
    (category === 'ALL' || destination.category === category) && `${destination.title} ${destination.region}`.toLowerCase().includes(query.toLowerCase()),
  ), [category, query]);

  return (
    <ScreenContainer backgroundColor={palette.slate[800]} isDark>
      <StatusBar style="light" />

      {/* Top Brand Bar */}
      <View style={styles.topBrandBar}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>T</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>TripMate</Text>
            <Text style={styles.brandSubtitle}>Clean Architecture & Theme Preview</Text>
          </View>
        </View>
        <Badge label="MVP READY" variant="coral" />
      </View>

      {/* Screen Selector Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {(
            [
              { id: 'overview', label: '🎨 Theme & Core' },
              { id: 'auth', label: '01. Login' },
              { id: 'explore', label: '03. Explore' },
              { id: 'destination', label: '04. Destination' },
              { id: 'trip', label: '05. Planner' },
              { id: 'planner', label: '✨ AI Plan' },
              { id: 'feed', label: '02. Feed' },
              { id: 'createPost', label: '09. Create Post' },
              { id: 'expense', label: '06. Expense' },
              { id: 'scanner', label: '07. Scanner' },
              { id: 'expenseReview', label: '08. Review OCR' },
              { id: 'profile', label: '10. Profile' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content Area styled like the 390px artboard in travelsofaka_ui.html */}
      <View style={styles.phoneFrame}>
        <ScrollView style={styles.screenScroll} contentContainerStyle={styles.scrollContent}>
          {/* TAB 1: THEME & CLEAN ARCHITECTURE OVERVIEW */}
          {activeTab === 'overview' && (
            <View style={styles.sectionContainer}>
              <Card style={styles.cardItem}>
                <Badge label="CLEAN ARCHITECTURE READY" variant="teal" style={{ marginBottom: spacing.md }} />
                <Text style={styles.headline}>Travelsofaka Core System</Text>
                <Text style={styles.bodyText}>
                  Codebase đã hoàn tất cấu trúc 3 lớp: Domain, Data, Presentation với hệ thống màu và typography chuẩn theo prototype.
                </Text>
              </Card>

              {/* Color Palette Visualizer */}
              <Card style={styles.cardItem}>
                <Text style={styles.cardTitle}>Bảng màu chủ đạo (Brand Palette)</Text>
                <View style={styles.paletteRow}>
                  <View style={[styles.colorBox, { backgroundColor: palette.teal[600] }]}>
                    <Text style={styles.colorTextLight}>Teal 600</Text>
                    <Text style={styles.colorHexLight}>#0D9488</Text>
                  </View>
                  <View style={[styles.colorBox, { backgroundColor: palette.coral[500] }]}>
                    <Text style={styles.colorTextLight}>Coral 500</Text>
                    <Text style={styles.colorHexLight}>#FF6B6B</Text>
                  </View>
                  <View style={[styles.colorBox, { backgroundColor: palette.slate[900] }]}>
                    <Text style={styles.colorTextLight}>Slate 900</Text>
                    <Text style={styles.colorHexLight}>#0F172A</Text>
                  </View>
                  <View style={[styles.colorBox, { backgroundColor: palette.amber[500] }]}>
                    <Text style={styles.colorTextLight}>Amber 500</Text>
                    <Text style={styles.colorHexLight}>#F59E0B</Text>
                  </View>
                </View>
              </Card>

              {/* UI Component Showcase */}
              <Card style={styles.cardItem}>
                <Text style={styles.cardTitle}>Common UI Components</Text>
                <View style={{ gap: spacing.base }}>
                  <Button title="Primary Button (Teal 600)" variant="primary" />
                  <Button title="Action Button (Coral 500)" variant="secondary" />
                  <Button title="Outline Button" variant="outline" />
                  <View style={styles.badgeRow}>
                    <Badge label="Active Trip" variant="teal" />
                    <Badge label="OCR Verified" variant="teal" />
                    <Badge label="★ 4.9 Rating" variant="amber" />
                    <Badge label="Student Squad" variant="coral" />
                  </View>
                </View>
              </Card>
            </View>
          )}

          {/* TAB 2: SCREEN 01 LOGIN PREVIEW */}
          {activeTab === 'auth' && (
            <View style={styles.sectionContainer}>
              <View style={styles.heroImageWrapper}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800' }}
                  style={styles.heroImage}
                />
                <View style={styles.heroOverlay}>
                  <Badge label="STUDENT TRAVEL SQUAD" variant="coral" style={{ marginBottom: 6 }} />
                  <Text style={styles.heroTitle}>TripMate</Text>
                  <Text style={styles.heroSubtitle}>Plan together, split bills easily, travel further.</Text>
                </View>
              </View>

              <Card style={styles.cardItem}>
                <Input
                  label="University or Personal Email"
                  defaultValue="viet.tran@student.edu.vn"
                  placeholder="name@student.edu.vn"
                />
                <Input
                  label="Password"
                  defaultValue="••••••••••••"
                  placeholder="Enter password"
                  secureTextEntry
                />
                <Button title="Sign In to TripMate" variant="primary" style={{ marginTop: spacing.xs }} />

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button title="Continue with Google" variant="outline" />
              </Card>
            </View>
          )}

          {activeTab === 'explore' && (
            <View style={styles.sectionContainer}>
              <View><Text style={styles.headline}>Find your next escape</Text><Text style={styles.bodyText}>Khám phá điểm đến hợp với lịch trình và ngân sách của bạn.</Text></View>
              <Input label="Tìm điểm đến" value={query} onChangeText={setQuery} placeholder="Da Nang, Da Lat..." />
              <View style={styles.badgeRow}>{['ALL', 'BEACHES', 'MOUNTAINS', 'HERITAGE'].map((item) => <TouchableOpacity key={item} onPress={() => setCategory(item)}><Badge label={item === 'ALL' ? 'All' : item === 'BEACHES' ? 'Beaches' : item === 'MOUNTAINS' ? 'Mountains' : 'Heritage'} variant={category === item ? 'teal' : 'amber'} /></TouchableOpacity>)}</View>
              {visibleDestinations.map((item) => <TouchableOpacity key={item.id} activeOpacity={0.85} onPress={() => { setSelectedDestinationId(item.id); setActiveTab('destination'); }}><Card style={styles.destinationCard}><Image source={{ uri: `https://images.unsplash.com/${item.image}?w=900` }} style={styles.destinationImage} /><View style={{ padding: spacing.base }}><View style={styles.rowBetween}><Text style={styles.cardTitle}>{item.title}</Text><Badge label={`★ ${item.rating}`} variant="amber" /></View><Text style={styles.metaSubtitle}>{item.subtitle} · {item.region}</Text><Text style={styles.bodyText}>Từ {item.budget.toLocaleString()} VND / ngày</Text></View></Card></TouchableOpacity>)}
              {visibleDestinations.length === 0 && <Text style={styles.bodyText}>Không tìm thấy điểm đến phù hợp.</Text>}
            </View>
          )}

          {activeTab === 'destination' && (
            <View style={styles.sectionContainer}>
              <Image source={{ uri: `https://images.unsplash.com/${selectedDestination.image}?w=1000` }} style={styles.destinationHero} />
              <Card style={styles.cardItem}><Badge label={selectedDestination.region} variant="teal" /><Text style={[styles.headline, { marginTop: spacing.md }]}>{selectedDestination.title}</Text><Text style={styles.bodyText}>{selectedDestination.about}</Text><View style={styles.destinationStats}><Text style={styles.tagText}>★ {selectedDestination.rating} · {selectedDestination.category}</Text><Text style={styles.tagText}>{selectedDestination.budget.toLocaleString()} VND/ngày</Text></View><Text style={styles.cardTitle}>Traveler notes</Text><Text style={styles.bodyText}>Lên lịch đi sớm để tận hưởng điểm tham quan và chừa thời gian khám phá ẩm thực địa phương.</Text><Button title="+ Add to Trip" variant="primary" style={{ marginTop: spacing.base }} onPress={() => { if (activeTrip) updateTrip({ destinations: Array.from(new Set([...activeTrip.destinations, selectedDestination.title])) }); setActiveTab('planner'); }} /></Card>
              <Button title="← Back to Explore" variant="outline" onPress={() => setActiveTab('explore')} />
            </View>
          )}

          {activeTab === 'planner' && (
            <View style={styles.sectionContainer}>
              <Card style={styles.cardItem}><Badge label="AI TRIP PLANNER" variant="coral" /><Text style={[styles.headline, { marginTop: spacing.md }]}>Build a trip that fits you</Text><Input label="Điểm đến" value={selectedDestination.title} onChangeText={(value) => setSelectedDestinationId(destinations.find((item) => item.title.toLowerCase() === value.toLowerCase())?.id ?? selectedDestinationId)} placeholder="Ví dụ: Da Nang" /><View style={styles.formRow}><View style={styles.formColumn}><Input label="Số ngày" value={tripDays} onChangeText={setTripDays} keyboardType="number-pad" /></View><View style={styles.formColumn}><Input label="Ngân sách (VND)" value={tripBudget} onChangeText={setTripBudget} keyboardType="number-pad" /></View></View><Input label="Sở thích" value={preferences} onChangeText={setPreferences} multiline placeholder="Ẩm thực, thiên nhiên..." /><Button title={isLoading ? 'Đang tạo lịch trình…' : '✨ Tạo lịch trình bằng AI'} variant="primary" isLoading={isLoading} disabled={isLoading} onPress={async () => { setPlannerError(''); const days = Number(tripDays); const budget = Number(tripBudget); if (!Number.isInteger(days) || days < 1 || days > 14 || !Number.isFinite(budget) || budget <= 0) { setPlannerError('Nhập số ngày từ 1–14 và ngân sách lớn hơn 0.'); return; } try { await generateItinerary(selectedDestination.title, days, budget, preferences); setActiveTab('trip'); } catch (error) { setPlannerError(error instanceof Error ? error.message : 'Tạo lịch trình thất bại.'); } }} />{plannerError ? <Text style={styles.errorText}>{plannerError}</Text> : <Text style={styles.metaSubtitle}>Cần cấu hình EXPO_PUBLIC_GEMINI_API_KEY để gọi Gemini.</Text>}</Card>
            </View>
          )}

          {activeTab === 'feed' && (
            <View style={styles.sectionContainer}>
              <View style={styles.rowBetween}><View><Text style={styles.headline}>Travel community</Text><Text style={styles.bodyText}>Stories and tips from your travel squad.</Text></View><Button title="＋ Post" size="sm" fullWidth={false} onPress={() => setActiveTab('createPost')} /></View>
              {posts.map((post) => <Card key={post.id} padding="none" style={styles.postCard}><View style={styles.postHeader}><Image source={{ uri: post.authorAvatar }} style={styles.postAvatar} /><View style={{ flex: 1 }}><Text style={styles.expenseName}>{post.authorName}</Text><Text style={styles.metaSubtitle}>{post.destinationTag} · {post.timeAgo}</Text></View></View><Image source={{ uri: post.imageUrl }} style={styles.postImage} /><View style={styles.postContent}><Text style={styles.postCaption}>{post.caption}</Text><View style={styles.rowBetween}><TouchableOpacity onPress={() => likePost(post.id)}><Text style={styles.postAction}>♥  {post.likesCount} likes</Text></TouchableOpacity><Text style={styles.postAction}>💬  {post.commentsCount} comments</Text></View></View></Card>)}
            </View>
          )}

          {activeTab === 'createPost' && (
            <View style={styles.sectionContainer}><Card style={styles.cardItem}><Text style={styles.headline}>Share a travel moment</Text><Text style={styles.bodyText}>Đăng ảnh và mẹo du lịch cho cộng đồng.</Text><Image source={{ uri: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800' }} style={styles.postComposerImage} /><Button title="Choose photo" variant="outline" style={{ marginVertical: spacing.md }} /><Input label="Destination tag" value={postDestination} onChangeText={setPostDestination} placeholder="Hoi An Ancient Town" /><Input label="Caption" value={postCaption} onChangeText={setPostCaption} multiline placeholder="Chia sẻ trải nghiệm của bạn..." /><Button title="Publish post" variant="primary" disabled={!postCaption.trim()} onPress={() => { const post: TravelPost = { id: `post_${Date.now()}`, authorUid: user?.uid ?? 'user_duc_pham', authorName: user?.displayName ?? 'Phạm Ngọc Đức', authorAvatar: user?.avatarUrl ?? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', destinationTag: `📍 ${postDestination}`, imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800', caption: postCaption.trim(), likesCount: 0, commentsCount: 0, timeAgo: 'just now', createdAt: Date.now() }; addPost(post); setPostCaption(''); setActiveTab('feed'); }} /></Card></View>
          )}

          {/* TAB 3: SCREEN 05 TRIP PLANNER PREVIEW */}
          {activeTab === 'trip' && activeTrip && (
            <View style={styles.sectionContainer}>
              <Card style={styles.cardItem}>
                <Text style={styles.metaLabel}>ACTIVE TRIP</Text>
                <Text style={styles.cardTitle}>{activeTrip.title}</Text>
                <View style={styles.tripMetaRow}>
                  <Text style={styles.tagText}>📅 {activeTrip.startDate} – {activeTrip.endDate}</Text>
                  <Text style={[styles.tagText, { color: palette.teal[700], fontWeight: 'bold' }]}>
                    💰 {activeTrip.budgetTotal.toLocaleString()} VND
                  </Text>
                </View>
                <View style={styles.badgeRow}>
                  {activeTrip.destinations.map((d) => (
                    <Badge key={d} label={`📍 ${d}`} variant="teal" />
                  ))}
                </View>
              </Card>

              {/* Day Tabs */}
              <View style={styles.daySelector}>
              {Array.from({ length: Math.max(1, ...activeTrip.activities.map((activity) => activity.dayIndex)) }, (_, index) => index + 1).map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setSelectedDayIndex(day)}
                    style={[
                      styles.dayButton,
                      selectedDayIndex === day && styles.dayButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDayIndex === day && styles.dayButtonTextActive,
                      ]}
                    >
                      Day {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Day Activities */}
              <Card style={styles.cardItem}>
                <Text style={styles.cardTitle}>Daily Schedule (Day {selectedDayIndex})</Text>
                {activeTrip.activities
                  .filter((a) => a.dayIndex === selectedDayIndex)
                  .map((act) => (
                    <View key={act.id} style={styles.activityItem}>
                      <Text style={styles.activityTime}>{act.time}</Text>
                      <Text style={styles.activityTitle}>{act.title}</Text>
                    </View>
                  ))}
                <Button title="✨ Generate with AI" variant="outline" size="sm" style={{ marginTop: spacing.md }} onPress={() => setActiveTab('planner')} />
              </Card>
            </View>
          )}

          {/* TAB 4: SCREEN 06 EXPENSE PREVIEW */}
          {activeTab === 'expense' && (
            <View style={styles.sectionContainer}>
              <Card style={styles.cardItem}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.metaLabel}>GROUP EXPENSE SUMMARY</Text>
                    <Text style={styles.moneyTitle}>{totalSpent.toLocaleString()} VND</Text>
                    <Text style={styles.metaSubtitle}>of {totalBudget.toLocaleString()} VND budget</Text>
                  </View>
                  <Button title="📷 Scan Receipt" variant="secondary" size="sm" fullWidth={false} onPress={() => setActiveTab('scanner')} />
                </View>

                {/* Budget Progress Bar */}
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` },
                    ]}
                  />
                </View>

                {/* Expense List */}
                <View style={{ marginTop: spacing.base, gap: spacing.base }}>
                  {expenses.map((item) => (
                    <View key={item.id} style={styles.expenseRow}>
                      <View>
                      <Text style={styles.expenseName}>{item.merchantName} {item.isFromOCR ? '· OCR' : ''}</Text>
                        <Text style={styles.expenseDate}>{item.date} • Split: {item.splitMemberUids.join(', ')}</Text>
                      </View>
                      <Text style={styles.expenseAmount}>{item.amount.toLocaleString()} VND</Text>
                    </View>
                  ))}
                </View>
              </Card>
            </View>
          )}

          {activeTab === 'scanner' && (
            <View style={styles.sectionContainer}><View style={styles.scannerPreview}><Image source={{ uri: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900' }} style={styles.scannerImage} /><View style={styles.scannerOverlay}><Text style={styles.scannerTitle}>Align receipt within frame</Text><Text style={styles.scannerHint}>Receipt scanning preview</Text></View></View><Card style={styles.cardItem}><Text style={styles.cardTitle}>Scan a receipt</Text><Text style={styles.bodyText}>Đặt hóa đơn trong khung, giữ máy ổn định rồi chụp. Bản Sprint 1 đang dùng luồng preview.</Text><Button title="Take photo & review" variant="primary" style={{ marginTop: spacing.base }} onPress={() => setActiveTab('expenseReview')} /><Button title="Choose from library" variant="outline" style={{ marginTop: spacing.sm }} onPress={() => setActiveTab('expenseReview')} /></Card></View>
          )}

          {activeTab === 'expenseReview' && (
            <View style={styles.sectionContainer}><Card style={styles.cardItem}><Badge label="OCR RESULT · REVIEW BEFORE SAVING" variant="teal" /><Text style={[styles.headline, { marginTop: spacing.md }]}>Review expense</Text><Input label="Merchant" value={receiptMerchant} onChangeText={setReceiptMerchant} /><Input label="Date" defaultValue={new Date().toLocaleDateString('vi-VN')} /><Input label="Total amount (VND)" value={receiptAmount} onChangeText={setReceiptAmount} keyboardType="number-pad" /><Text style={styles.inputLabel}>Category</Text><View style={styles.badgeRow}>{([['FOOD', 'Food'], ['TRANSPORT', 'Transport'], ['HOMESTAY', 'Stay'], ['ENTERTAINMENT', 'Entertainment'], ['OTHER', 'Other']] as [ExpenseCategory, string][]).map(([value, label]) => <TouchableOpacity key={value} onPress={() => setReceiptCategory(value)}><Badge label={label} variant={receiptCategory === value ? 'teal' : 'slate'} /></TouchableOpacity>)}</View><Text style={[styles.inputLabel, { marginTop: spacing.base }]}>Split with</Text><View style={styles.badgeRow}>{['Việt', 'Minh Anh', 'Bảo', 'Tú'].map((member) => { const selected = receiptMembers.includes(member); return <TouchableOpacity key={member} onPress={() => setReceiptMembers(selected ? receiptMembers.filter((name) => name !== member) : [...receiptMembers, member])}><Badge label={`${selected ? '✓ ' : ''}${member}`} variant={selected ? 'coral' : 'slate'} /></TouchableOpacity>; })}</View><Button title="Save expense" variant="primary" style={{ marginTop: spacing.xl }} onPress={() => { const amount = Number(receiptAmount.replace(/[^0-9]/g, '')); if (!receiptMerchant.trim() || !amount || receiptMembers.length === 0) return; addExpense({ id: `exp_${Date.now()}`, tripId: activeTrip?.id ?? '', merchantName: receiptMerchant.trim(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), amount, category: receiptCategory, isFromOCR: true, splitMemberUids: receiptMembers, createdAt: Date.now(), isSynced: false }); setActiveTab('expense'); }} /><Button title="Back to scanner" variant="ghost" style={{ marginTop: spacing.sm }} onPress={() => setActiveTab('scanner')} /></Card></View>
          )}

          {/* TAB 5: SCREEN 10 USER PROFILE PREVIEW */}
          {activeTab === 'profile' && user && (
            <View style={styles.sectionContainer}>
              <Card style={styles.cardItem}>
                <View style={styles.profileHeader}>
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.profileName}>{user.displayName}</Text>
                    <Text style={styles.profileRole}>@viet.travels • Senior CS Student</Text>
                    <Badge label={`📍 ${user.location}`} variant="teal" style={{ marginTop: 4 }} />
                  </View>
                </View>
                <Text style={styles.profileBio}>{user.bio}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{user.tripsCount}</Text>
                    <Text style={styles.statLabel}>TRIPS</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{user.savedCount}</Text>
                    <Text style={styles.statLabel}>SAVED</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{user.friendsCount}</Text>
                    <Text style={styles.statLabel}>FRIENDS</Text>
                  </View>
                </View>
              </Card>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBrandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.base,
    backgroundColor: palette.slate[900],
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: palette.teal[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: palette.common.white,
    fontWeight: typography.fontWeights.extrabold,
    fontSize: typography.fontSizes.lg,
  },
  brandTitle: {
    color: palette.common.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.extrabold,
  },
  brandSubtitle: {
    color: palette.slate[400],
    fontSize: typography.fontSizes['2xs'],
  },
  tabContainer: {
    backgroundColor: palette.slate[900],
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: palette.slate[800],
  },
  tabScroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    backgroundColor: palette.slate[800],
  },
  tabButtonActive: {
    backgroundColor: palette.teal[600],
  },
  tabButtonText: {
    color: palette.slate[400],
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  tabButtonTextActive: {
    color: palette.common.white,
    fontWeight: typography.fontWeights.bold,
  },
  phoneFrame: {
    flex: 1,
    backgroundColor: palette.slate[50],
  },
  screenScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  sectionContainer: {
    gap: spacing.xl,
  },
  cardItem: {
    backgroundColor: palette.common.white,
  },
  postCard: {
    backgroundColor: palette.common.white,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
  },
  postAvatar: {
    width: 42,
    height: 42,
    borderRadius: radii.full,
  },
  postImage: {
    width: '100%',
    height: 220,
  },
  postContent: {
    padding: spacing.base,
    gap: spacing.md,
  },
  postCaption: {
    color: palette.slate[800],
    fontSize: typography.fontSizes.sm,
    lineHeight: typography.lineHeights.base,
  },
  postAction: {
    color: palette.teal[700],
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  postComposerImage: {
    width: '100%',
    height: 190,
    borderRadius: radii.lg,
    marginTop: spacing.base,
  },
  scannerPreview: {
    height: 360,
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    backgroundColor: palette.slate[900],
    justifyContent: 'flex-end',
  },
  scannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  scannerOverlay: {
    margin: spacing.xl,
    height: 230,
    borderWidth: 2,
    borderColor: palette.common.white,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.base,
  },
  scannerTitle: {
    color: palette.common.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.md,
  },
  scannerHint: {
    color: palette.slate[100],
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xs,
  },
  inputLabel: {
    color: palette.slate[600],
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.xs,
  },
  destinationCard: {
    backgroundColor: palette.common.white,
    padding: 0,
    overflow: 'hidden',
  },
  destinationImage: {
    width: '100%',
    height: 160,
  },
  destinationHero: {
    width: '100%',
    height: 220,
    borderRadius: radii['2xl'],
  },
  destinationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.base,
    marginVertical: spacing.base,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.slate[100],
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formColumn: {
    flex: 1,
  },
  errorText: {
    color: palette.rose[500],
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.sm,
  },
  headline: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
    marginBottom: spacing.xs,
  },
  bodyText: {
    fontSize: typography.fontSizes.base,
    color: palette.slate[600],
    lineHeight: typography.lineHeights.base,
  },
  cardTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[900],
    marginBottom: spacing.base,
  },
  paletteRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  colorBox: {
    flex: 1,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorTextLight: {
    color: palette.common.white,
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
  },
  colorHexLight: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  heroImageWrapper: {
    height: 190,
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: palette.teal[900],
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: 'rgba(19, 78, 74, 0.75)',
  },
  heroTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.extrabold,
    color: palette.common.white,
  },
  heroSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: palette.teal[100],
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.slate[200],
  },
  dividerText: {
    fontSize: typography.fontSizes['2xs'],
    color: palette.slate[400],
    fontWeight: typography.fontWeights.bold,
  },
  metaLabel: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
    marginBottom: 4,
  },
  tripMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  tagText: {
    fontSize: typography.fontSizes.sm,
    color: palette.slate[700],
  },
  daySelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: palette.slate[200],
    borderRadius: radii.md,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: palette.teal[600],
  },
  dayButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[700],
  },
  dayButtonTextActive: {
    color: palette.common.white,
  },
  activityItem: {
    backgroundColor: palette.slate[50],
    borderWidth: 1,
    borderColor: palette.slate[100],
    borderRadius: radii.md,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  activityTime: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.teal[700],
  },
  activityTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: palette.slate[800],
    marginTop: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  moneyTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  metaSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[500],
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: palette.slate[100],
    borderRadius: radii.full,
    overflow: 'hidden',
    marginTop: spacing.base,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: palette.teal[600],
    borderRadius: radii.full,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: palette.slate[100],
  },
  expenseName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[900],
  },
  expenseDate: {
    fontSize: typography.fontSizes['2xs'],
    color: palette.slate[400],
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.teal[600],
  },
  profileHeader: {
    flexDirection: 'row',
    gap: spacing.base,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    borderWidth: 3,
    borderColor: palette.teal[200],
  },
  profileName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  profileRole: {
    fontSize: typography.fontSizes.xs,
    color: palette.slate[500],
  },
  profileBio: {
    fontSize: typography.fontSizes.sm,
    color: palette.slate[600],
    marginTop: spacing.base,
    lineHeight: typography.lineHeights.sm,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: palette.slate[100],
    marginTop: spacing.base,
    paddingTop: spacing.base,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.extrabold,
    color: palette.slate[900],
  },
  statLabel: {
    fontSize: typography.fontSizes['2xs'],
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
    marginTop: 2,
  },
});
