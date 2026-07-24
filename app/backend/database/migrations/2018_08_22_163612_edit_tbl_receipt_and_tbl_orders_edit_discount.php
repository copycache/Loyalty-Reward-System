<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class EditTblReceiptAndTblOrdersEditDiscount extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if(Schema::hasColumn('tbl_receipt', 'discount_type'))
        {
            Schema::table('tbl_receipt', function (Blueprint $table) 
            {
                $table->dropColumn('discount_type');
            }); 
        }

        if(Schema::hasColumn('tbl_receipt', 'discount'))
        {
            Schema::table('tbl_receipt', function (Blueprint $table) 
            {
                $table->dropColumn('discount');
            }); 
        }

        if(Schema::hasColumn('tbl_orders', 'discount_type'))
        {
            Schema::table('tbl_orders', function (Blueprint $table) 
            {
                $table->dropColumn('discount_type');
            }); 
        }

        if(Schema::hasColumn('tbl_orders', 'discount'))
        {
            Schema::table('tbl_orders', function (Blueprint $table) 
            {
                $table->dropColumn('discount');
            }); 
        }

        if(!Schema::hasColumn('tbl_orders', 'discount'))
        {
            Schema::table('tbl_orders', function (Blueprint $table) 
            {
                $table->text('discount');
            }); 
        }

        if(!Schema::hasColumn('tbl_receipt', 'discount'))
        {
            Schema::table('tbl_receipt', function (Blueprint $table) 
            {
                $table->text('discount');
            }); 
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
