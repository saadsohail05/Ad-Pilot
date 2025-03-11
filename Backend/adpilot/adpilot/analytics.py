from sqlmodel import Session, select
from .models import Metrics, Campaign
from .db import engine
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64
import numpy as np

# Set up seaborn style
sns.set_theme(style="whitegrid")
# Use a built-in matplotlib style
plt.style.use('bmh')

# Custom color scheme
COLORS = {
    'facebook': '#4267B2',  # Facebook blue
    'instagram': '#E1306C',  # Instagram pink
    'background': '#f8f9fa',
    'grid': '#dee2e6',
    'text': '#212529'
}

def setup_plot_style(ax):
    """Apply consistent, modern styling to plots"""
    ax.set_facecolor(COLORS['background'])
    ax.grid(True, linestyle='--', alpha=0.7, color=COLORS['grid'])
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(COLORS['grid'])
    ax.spines['bottom'].set_color(COLORS['grid'])
    ax.tick_params(colors=COLORS['text'])
    plt.gcf().set_facecolor(COLORS['background'])

def convert_to_native_types(value):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(value, (np.int64, np.int32, np.int16, np.int8)):
        return int(value)
    if isinstance(value, (np.float64, np.float32)):
        return float(value)
    if isinstance(value, np.bool_):
        return bool(value)
    return value

def check_platform_metrics(df: pd.DataFrame, platform: str) -> bool:
    """Check if any metrics for a platform are non-zero and non-null"""
    platform_cols = [col for col in df.columns if col.startswith(platform)]
    return df[platform_cols].sum().sum() > 0 and not df[platform_cols].isnull().all().all()

def get_campaign_metrics(user_id: int):
    """Get metrics data for all campaigns of a user"""
    with Session(engine) as session:
        query = select(Metrics, Campaign.name).join(Campaign, Metrics.campaign_id == Campaign.id).where(Metrics.user_id == user_id)
        results = session.exec(query).all()
        
        metrics_data = []
        for metrics, campaign_name in results:
            metrics_dict = {
                'campaign_name': campaign_name,
                'fb_post_clicks': metrics.fb_post_clicks,
                'fb_likes': metrics.fb_likes,
                'fb_reactions': metrics.fb_reactions,
                'fb_shares': metrics.fb_shares,
                'fb_comments': metrics.fb_comments,
                'insta_post_clicks': metrics.insta_post_clicks,
                'insta_likes': metrics.insta_likes,
                'insta_reactions': metrics.insta_reactions,
                'insta_shares': metrics.insta_shares,
                'insta_comments': metrics.insta_comments
            }
            metrics_data.append(metrics_dict)
        
        return pd.DataFrame(metrics_data)

def generate_engagement_charts(df: pd.DataFrame):
    """Generate visually attractive visualization charts for engagement metrics"""
    charts = {}
    
    # Check which platforms have data
    has_fb_data = check_platform_metrics(df, 'fb')
    has_insta_data = check_platform_metrics(df, 'insta')
    
    if has_fb_data or has_insta_data:
        # Platform Comparison Chart
        fig, ax = plt.subplots(figsize=(12, 6), dpi=100)
        
        # Prepare metrics for platforms that have data
        comparison_data = {}
        if has_fb_data:
            fb_metrics = ['fb_likes', 'fb_reactions', 'fb_shares', 'fb_comments']
            comparison_data['Facebook'] = df[fb_metrics].sum()
        
        if has_insta_data:
            insta_metrics = ['insta_likes', 'insta_reactions', 'insta_shares', 'insta_comments']
            comparison_data['Instagram'] = df[insta_metrics].sum()
        
        if comparison_data:
            comparison_df = pd.DataFrame(comparison_data)
            
            # Create enhanced bar plot
            colors = [COLORS['facebook'], COLORS['instagram']]
            bars = comparison_df.plot(kind='bar', ax=ax, width=0.8, color=colors)
            
            # Add value labels on top of bars
            for container in bars.containers:
                ax.bar_label(container, padding=3, fmt='%.0f', 
                           fontsize=10, fontweight='bold')
            
            # Styling
            setup_plot_style(ax)
            plt.title('Platform Engagement Comparison', 
                     fontsize=16, fontweight='bold', pad=20)
            plt.xlabel('Engagement Type', fontsize=12, labelpad=10)
            plt.ylabel('Number of Interactions', fontsize=12, labelpad=10)
            plt.xticks(rotation=45, ha='right')
            plt.legend(loc='upper right', frameon=True, facecolor=COLORS['background'])
            plt.tight_layout()
            
            # Convert plot to base64 image
            buffer = BytesIO()
            plt.savefig(buffer, format='png', bbox_inches='tight', 
                       facecolor=COLORS['background'])
            buffer.seek(0)
            image_png = buffer.getvalue()
            buffer.close()
            
            charts['platform_comparison'] = base64.b64encode(image_png).decode()
    
    # Campaign Performance Chart with enhanced visuals
    if df.empty:
        return charts

    metric_cols = []
    if has_fb_data:
        metric_cols.extend(['fb_likes', 'fb_reactions', 'fb_shares', 'fb_comments'])
    if has_insta_data:
        metric_cols.extend(['insta_likes', 'insta_reactions', 'insta_shares', 'insta_comments'])
    
    if metric_cols:
        fig, ax = plt.subplots(figsize=(12, 6), dpi=100)
        
        # Calculate total engagement and sort by performance
        df['total_engagement'] = df[metric_cols].sum(axis=1)
        df_sorted = df.sort_values('total_engagement', ascending=True)
        
        # Create enhanced bar plot with gradient colors
        colors = sns.color_palette("viridis", len(df_sorted))
        bars = sns.barplot(data=df_sorted, x='campaign_name', y='total_engagement', 
                          palette=colors, ax=ax)
        
        # Add value labels on top of bars
        for i, v in enumerate(df_sorted['total_engagement']):
            ax.text(i, v, f'{int(v):,}', ha='center', va='bottom',
                   fontsize=10, fontweight='bold')
        
        # Styling
        setup_plot_style(ax)
        plt.title('Campaign Performance Overview', 
                 fontsize=16, fontweight='bold', pad=20)
        plt.xlabel('Campaign Name', fontsize=12, labelpad=10)
        plt.ylabel('Total Engagement', fontsize=12, labelpad=10)
        plt.xticks(rotation=45, ha='right')
        
        # Add subtle gradient background
        ax.set_axisbelow(True)
        plt.tight_layout()
        
        # Convert plot to base64 image
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight',
                   facecolor=COLORS['background'])
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        
        charts['campaign_performance'] = base64.b64encode(image_png).decode()

    # Create engagement distribution donut chart
    if metric_cols:
        fig, ax = plt.subplots(figsize=(10, 10), dpi=100)
        
        # Calculate platform totals
        platform_totals = {}
        if has_fb_data:
            platform_totals['Facebook'] = df[['fb_likes', 'fb_reactions', 
                                           'fb_shares', 'fb_comments']].sum().sum()
        if has_insta_data:
            platform_totals['Instagram'] = df[['insta_likes', 'insta_reactions',
                                             'insta_shares', 'insta_comments']].sum().sum()
        
        # Create donut chart
        colors = [COLORS['facebook'], COLORS['instagram']]
        wedges, texts, autotexts = ax.pie(
            platform_totals.values(),
            labels=platform_totals.keys(),
            colors=colors,
            autopct='%1.1f%%',
            pctdistance=0.85,
            wedgeprops=dict(width=0.5)
        )
        
        # Styling
        plt.title('Engagement Distribution by Platform',
                 fontsize=16, fontweight='bold', pad=20)
        plt.setp(autotexts, size=9, weight="bold")
        plt.setp(texts, size=12)
        
        # Create center circle for donut effect
        centre_circle = plt.Circle((0,0), 0.70, fc=COLORS['background'])
        fig.gca().add_artist(centre_circle)
        
        # Add total engagement number in center
        total = sum(platform_totals.values())
        plt.text(0, 0, f'Total\n{int(total):,}',
                ha='center', va='center',
                fontsize=12, fontweight='bold')
        
        plt.axis('equal')
        
        # Convert plot to base64 image
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight',
                   facecolor=COLORS['background'])
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        
        charts['engagement_distribution'] = base64.b64encode(image_png).decode()
    
    return charts

def has_non_zero_metrics(row: pd.Series) -> bool:
    """Check if a campaign has any non-zero metrics."""
    metric_cols = [
        'fb_post_clicks', 'fb_likes', 'fb_reactions', 'fb_shares', 'fb_comments',
        'insta_post_clicks', 'insta_likes', 'insta_reactions', 'insta_shares', 'insta_comments'
    ]
    return any(row[col] > 0 for col in metric_cols if pd.notna(row[col]))

def get_analytics_data(user_id: int):
    """Get complete analytics data including metrics and visualizations"""
    # Get metrics data
    df = get_campaign_metrics(user_id)
    
    # Filter out campaigns where all metrics are 0 or null
    df = df[df.apply(has_non_zero_metrics, axis=1)]
    
    # If all campaigns were filtered out, return empty analytics
    if df.empty:
        return {
            'summary': {'total_campaigns': 0},
            'charts': {},
            'metrics': [],
            'platforms_used': {'facebook': False, 'instagram': False}
        }
    
    # Check which platforms have data and convert numpy.bool_ to Python bool
    has_fb_data = bool(check_platform_metrics(df, 'fb'))
    has_insta_data = bool(check_platform_metrics(df, 'insta'))
    
    # Generate summary statistics only for platforms with data
    summary = {
        'total_campaigns': len(df),
    }
    
    if has_fb_data:
        summary['total_fb_engagement'] = convert_to_native_types(
            df[['fb_likes', 'fb_reactions', 'fb_shares', 'fb_comments']].sum().sum()
        )
    
    if has_insta_data:
        summary['total_insta_engagement'] = convert_to_native_types(
            df[['insta_likes', 'insta_reactions', 'insta_shares', 'insta_comments']].sum().sum()
        )
    
    # Calculate best performing campaign only if we have any engagement data
    if has_fb_data or has_insta_data:
        metric_cols = []
        if has_fb_data:
            metric_cols.extend(['fb_likes', 'fb_reactions', 'fb_shares', 'fb_comments'])
        if has_insta_data:
            metric_cols.extend(['insta_likes', 'insta_reactions', 'insta_shares', 'insta_comments'])
        
        df['total_engagement'] = df[metric_cols].sum(axis=1)
        if not df.empty:
            summary['best_performing_campaign'] = df.loc[df['total_engagement'].idxmax(), 'campaign_name']
    
    # Generate visualization charts
    charts = generate_engagement_charts(df) if not df.empty else {}
    
    # Filter metrics to include only non-zero platforms
    metrics_dict = df.to_dict('records') if not df.empty else []
    if metrics_dict:
        for metric in metrics_dict:
            if not has_fb_data:
                # Remove Facebook metrics
                for key in list(metric.keys()):
                    if key.startswith('fb_'):
                        del metric[key]
            if not has_insta_data:
                # Remove Instagram metrics
                for key in list(metric.keys()):
                    if key.startswith('insta_'):
                        del metric[key]
            # Convert any remaining numpy types to native Python types
            for key in metric:
                metric[key] = convert_to_native_types(metric[key])
    
    return {
        'summary': summary,
        'charts': charts,
        'metrics': metrics_dict,
        'platforms_used': {
            'facebook': bool(has_fb_data),
            'instagram': bool(has_insta_data)
        }
    }